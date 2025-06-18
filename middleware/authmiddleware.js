const jwt = require("jsonwebtoken");
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "Access denied. No token provided" 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET );
        
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password', 'emailVerificationToken', 'resetPasswordToken'] }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account is deactivated"
            });
        }

        req.userId = user.id; 
        req.user = user; 
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
    // This middleware should be used after authenticateToken
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (!req.user.is_admin) {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }

    next();
};

// Optional admin check (for routes that work differently for admins vs regular users)
const optionalAdmin = (req, res, next) => {
    if (req.user && req.user.is_admin) {
        req.isAdmin = true;
    } else {
        req.isAdmin = false;
    }
    next();
};

module.exports = { 
    authenticateToken, 
    requireAdmin, 
    optionalAdmin 
};