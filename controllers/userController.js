const { User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { generateSecureToken } = require('../util/passwordUtils');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        { expiresIn: '24h' }
    );
};

// Regex: 6-20 characters, must contain letters, and not only digits or only symbols
const strictPasswordRegex = /^(?=.*[A-Za-z])[A-Za-z\d\W]{6,20}$/;

// Generate email verification token
const generateEmailVerificationToken = () => {
    return generateSecureToken();
};

// Validate secure token with timing-safe comparison
const validateSecureToken = (providedToken, storedToken) => {
    if (!providedToken || !storedToken) return false;
    return crypto.timingSafeEqual(
        Buffer.from(providedToken, 'utf8'),
        Buffer.from(storedToken, 'utf8')
    );
};

// Check if token is expired
const isTokenExpired = (expiresAt) => {
    return new Date() > new Date(expiresAt);
};

// Create a new user
exports.register = async(req,res) =>{
    const { name, surname, email, password} = req.body;

    try{
        const existingUser = await User.findOne({
            where: { email: email }
        });
        
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newuser = await User.create({
            name,
            surname,
            email,
            password: hashedPassword
        });

        console.log("User registered successfully");
        console.log(`User Id: ${newuser.id}`);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: newuser.id,
                name: newuser.name,
                surname: newuser.surname,
                email: newuser.email
            }
        });
    } catch(error){
        console.log("Error in registration: ", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Login user with enhanced security
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is locked
        if (user.isLocked && user.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Compare password with timing-safe comparison
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            // Increment failed login attempts if method exists
            if (user.incLoginAttempts) {
                await user.incLoginAttempts();
            }
            
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Reset login attempts on successful login if method exists
        if (user.resetLoginAttempts) {
            await user.resetLoginAttempts();
        }

        // Generate JWT token
        const token = generateToken(user.id);

        // Return user without password
        res.json({
            success: true,
            message: 'Login successful',
            data: user.toJSON(),
            token
        });

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Verify email with secure token comparison
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        // Find user with this verification token
        const user = await User.findOne({
            where: { emailVerificationToken: token }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Use secure token comparison
        if (!validateSecureToken(token, user.emailVerificationToken)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token'
            });
        }

        // Update user to verified
        await user.update({
            emailVerified: true,
            emailVerificationToken: null
        });

        res.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Send numeric code to email for password reset
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email format" 
            });
        }

        const user = await User.findOne({ 
            where: { email: email }
        });
        
        if (!user) {
            return res.status(200).json({ 
                success: true,
                message: "If this email exists, a reset code was sent." 
            });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetCodeExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        await user.update({
            resetPasswordCode: resetCode,
            resetPasswordCodeExpires: resetCodeExpires
        });

        // Email configuration
        const transporter = nodemailer.createTransporter({
            service: "gmail",
            auth: {
                user: process.env.FROM_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: email,
            subject: "Your Password Reset Code",
            html: `<p>Your reset code is:</p><h2>${resetCode}</h2><p>Please don't share it with anyone! This code will expire in 5 minutes.</p>`
        });

        res.status(200).json({ 
            success: true,
            message: "Reset code sent to your email." 
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Server error" 
        });
    }
};

// Verify reset code only
exports.verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email format" 
            });
        }

        // Validate code format (6 digits)
        if (!code || !/^\d{6}$/.test(code)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid reset code format" 
            });
        }

        const user = await User.findOne({ 
            where: { email: email }
        });

        if (!user || !user.resetPasswordCode || !user.resetPasswordCodeExpires) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid or expired code" 
            });
        }

        if (Date.now() > user.resetPasswordCodeExpires) {
            return res.status(400).json({ 
                success: false,
                message: "Code has expired" 
            });
        }

        if (user.resetPasswordCode !== code) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid code" 
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Code verified successfully." 
        });
    } catch (error) {
        console.error("Verify Code Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Server error" 
        });
    }
};

// Set new password after verification
exports.setNewPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email format" 
            });
        }

        // Validate code format (6 digits)
        if (!code || !/^\d{6}$/.test(code)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid reset code format" 
            });
        }

        // Validate password strength
        if (!strictPasswordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must be 6-20 characters, contain at least one letter, and not be only digits or symbols."
            });
        }

        const user = await User.findOne({ 
            where: { email: email }
        });

        if (!user || !user.resetPasswordCode || !user.resetPasswordCodeExpires) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid or expired code" 
            });
        }

        if (Date.now() > user.resetPasswordCodeExpires) {
            return res.status(400).json({ 
                success: false,
                message: "Code has expired" 
            });
        }

        if (user.resetPasswordCode !== code) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid code" 
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        await user.update({
            password: hashedPassword,
            resetPasswordCode: null,
            resetPasswordCodeExpires: null
        });

        res.status(200).json({ 
            success: true,
            message: "Password reset successfully." 
        });
    } catch (error) {
        console.error("Set Password Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Server error" 
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user
        });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, surname, email } = req.body;
        const userId = req.user.id;

        // Check if email is already taken by another user
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({
                where: { 
                    email: email,
                    id: { [Op.ne]: userId }
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken'
                });
            }
        }

        // Update user
        await User.update(
            { name, surname, email },
            { where: { id: userId } }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get user with password
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await user.update({ password: hashedPassword });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all users (admin only - without passwords)
exports.getAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const users = await User.findAll({
            attributes: { 
                exclude: ['password', 'emailVerificationToken', 'resetPasswordToken'] 
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}; 