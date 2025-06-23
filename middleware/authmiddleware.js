const jwt = require("jsonwebtoken");
const db = require('../config/db');
const cookie = require('cookie-parser');

const authenticateToken = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "Access denied. No token provided" 
        });
    }

    try {
        const secretkey = process.env.JWT_SECRET;
        const decoded =jwt.verify(token,secretkey);

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

const isAdmin = (req, res, next) => {
    if (!req.user.is_admin) {
        next();
    } else {
        res.status(403).json({
          success: false,
          message: "no access. Not authorized as admin." });
    }
};



module.exports = { 
    authenticateToken, 
    isAdmin,
};