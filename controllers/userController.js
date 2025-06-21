const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { generateSecureToken } = require('../util/passwordUtils');
const cookie = require ('cookie-parser');


const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET ,
        { expiresIn: '24h' }
    );
};

const strictPasswordRegex = /^(?=.*[A-Za-z])[A-Za-z\d\W]{6,20}$/;

const generateEmailVerificationToken = () => {
    return generateSecureToken();
};

const validateSecureToken = (providedToken, storedToken) => {
    if (!providedToken || !storedToken) return false;
    return crypto.timingSafeEqual(
        Buffer.from(providedToken, 'utf8'),
        Buffer.from(storedToken, 'utf8')
    );
};

const isTokenExpired = (expiresAt) => {
    return new Date() > new Date(expiresAt);
};


exports.register = async (req, res) => {
    try {
        const { name, surname, email, password, is_admin} = req.body;
        
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1', 
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.query(
            `INSERT INTO users (name, surname, email, password, is_admin) 
             VALUES ($1, $2, $3, $4,$5) 
             RETURNING id, name, surname, email, created_at, is_admin`,
            [name, surname, email, hashedPassword,is_admin]
        );
        
        const user = newUser.rows[0];
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user,
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creating user' 
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
    
        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        const user = userResult.rows[0];

        const isPasswordcorrect = await bcrypt.compare(password, user.password);
        
        if (!isPasswordcorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user.id);

        res.cookie('token', token,{
            httpOnly: true,
            secure:process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge:20*60*60*1000
        });

        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            message: 'Login successful',
            data: userWithoutPassword,
            is_admin :user.is_admin,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie('token');
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        const userResult = await db.query(
            'SELECT * FROM users WHERE email_verification_token = $1',
            [token]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        const user = userResult.rows[0];

        if (!validateSecureToken(token, user.email_verification_token)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token'
            });
        }

        await db.query(
            'UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1',
            [user.id]
        );

        res.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

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

        const userResult = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(200).json({ 
                success: true,
                message: "If this email exists, a reset code was sent." 
            });
        }

        const user = userResult.rows[0];
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetCodeExpires = new Date(Date.now() + 5 * 60 * 1000); 

        await db.query(
            'UPDATE users SET reset_password_code = $1, reset_password_code_expires = $2 WHERE id = $3',
            [resetCode, resetCodeExpires, user.id]
        );

        const transporter = nodemailer.createTransport({
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

        const userResult = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0 || 
            !userResult.rows[0].reset_password_code || 
            !userResult.rows[0].reset_password_code_expires) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid or expired code" 
            });
        }

        const user = userResult.rows[0];

        if (new Date() > new Date(user.reset_password_code_expires)) {
            return res.status(400).json({ 
                success: false,
                message: "Code has expired" 
            });
        }

        if (user.reset_password_code !== code) {
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

        const userResult = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0 || 
            !userResult.rows[0].reset_password_code || 
            !userResult.rows[0].reset_password_code_expires) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid or expired code" 
            });
        }

        const user = userResult.rows[0];

        if (new Date() > new Date(user.reset_password_code_expires)) {
            return res.status(400).json({ 
                success: false,
                message: "Code has expired" 
            });
        }

        if (user.reset_password_code !== code) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid code" 
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        await db.query(
            'UPDATE users SET password = $1, reset_password_code = NULL, reset_password_code_expires = NULL WHERE id = $2',
            [hashedPassword, user.id]
        );

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

exports.getProfile = async (req, res) => {
    try {
        const userResult = await db.query(
            'SELECT id, name, surname, email, is_admin, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        const user = userResult.rows[0];

        const projectsResult = await db.query(
            'SELECT id, name, description FROM projects WHERE admin_id = $1',
            [user.id]
        );

        const tasksResult = await db.query(
            'SELECT id, name, status, is_completed FROM tasks WHERE user_id = $1',
            [user.id]
        );

        res.json({
            ...user,
            projects: projectsResult.rows,
            assignedTasks: tasksResult.rows
        });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, surname, email } = req.body;
        const userId = req.user.id;

        // Check if email is already taken by another user
        if (email && email !== req.user.email) {
            const existingUser = await db.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, userId]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken by another user !'
                });
            }
        }

        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (surname) {
            updates.push(`surname = $${paramCount++}`);
            values.push(surname);
        }
        if (email) {
            updates.push(`email = $${paramCount++}`);
            values.push(email);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided for update'
            });
        }

        values.push(userId);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, surname, email`;

        const updatedUser = await db.query(query, values);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser.rows[0]
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get user with password
        const userResult = await db.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await db.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, user.id]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const users = await db.query(
            'SELECT id, name, surname, email, is_admin, created_at FROM users ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            data: users.rows
        });

    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// admin only
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await db.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting user' 
        });
    }
};
