const { User } = require('../models');
const { Op } = require('sequelize');
const { generateToken, generateEmailVerificationToken, validateSecureToken, isTokenExpired } = require('../middleware/auth');
const { generateSecureToken } = require('../util/passwordUtils');

// Create a new user
const createUser = async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Generate secure email verification token
        const emailVerificationToken = generateEmailVerificationToken();

        // Create user (password will be automatically hashed by the model hook)
        const user = await User.create({
            username,
            email,
            password, // This will be hashed automatically by the model hook
            fullName,
            emailVerificationToken
        });

        // Generate JWT token
        const token = generateToken(user.id);

        // Return user without password
        res.status(201).json({
            success: true,
            message: 'User created successfully. Please verify your email.',
            data: user.toJSON(),
            token
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Login user with enhanced security
const loginUser = async (req, res) => {
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
        if (user.isLocked()) {
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
            // Increment failed login attempts
            await user.incLoginAttempts();
            
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

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
const verifyEmail = async (req, res) => {
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

// Request password reset with secure token
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            // Don't reveal if user exists or not (security best practice)
            return res.json({
                success: true,
                message: 'If an account with this email exists, a password reset link has been sent.'
            });
        }

        // Generate secure reset token
        const resetToken = generateSecureToken();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Update user with reset token
        await user.update({
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires
        });

        // In a real application, send email here
        console.log(`Password reset token for ${email}: ${resetToken}`);

        res.json({
            success: true,
            message: 'If an account with this email exists, a password reset link has been sent.'
        });

    } catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Reset password with secure token validation
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }

        // Find user with this reset token
        const user = await User.findOne({
            where: { resetPasswordToken: token }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Check if token is expired
        if (isTokenExpired(user.resetPasswordExpires)) {
            return res.status(400).json({
                success: false,
                message: 'Reset token has expired'
            });
        }

        // Use secure token comparison
        if (!validateSecureToken(token, user.resetPasswordToken)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset token'
            });
        }

        // Update password and clear reset token
        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const userId = req.user.id;

        // Check if email is being changed and if it's already taken
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
        const updatedUser = await User.update(
            { fullName, email },
            { 
                where: { id: userId },
                returning: true
            }
        );

        // Get updated user data
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
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
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);

        // Verify current password with timing-safe comparison
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password (will be hashed automatically)
        user.password = newPassword;
        await user.save();

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
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password', 'emailVerificationToken', 'resetPasswordToken'] }
        });

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createUser,
    loginUser,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers
}; 