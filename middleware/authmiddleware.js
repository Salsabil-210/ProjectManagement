const jwt = require("jsonwebtoken");
const db = require('../config/db');

const authenticateToken = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "Access denied. No token provided" 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const userResult = await db.query(
            'SELECT id, name, surname, email, is_admin FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.userId = userResult.rows[0].id; 
        req.user = userResult.rows[0]; 
        
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

// Optional admin check
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