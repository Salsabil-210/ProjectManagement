const express = require("express");
const router = express.Router();

//  validation middleware
const { 
    validateRegistration, 
    validateLogin, 
    validatePasswordReset, 
    validateNewPassword, 
    validateProfileUpdate, 
    validateChangePassword 
} = require('../util/validation');

const { authenticateToken, requireAdmin } = require('../middleware/authmiddleware');

// Import controllers
const userController = require('../controllers/userController');

// User authentication routes
router.post('/register', validateRegistration, userController.register);
router.post('/login', validateLogin, userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-reset-code', userController.verifyResetCode);
router.post('/set-new-password', userController.setNewPassword);

// Protected user routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, userController.updateProfile);
router.put('/change-password', authenticateToken, validateChangePassword, userController.changePassword);

// Admin-only routes
router.get('/all', authenticateToken, requireAdmin, userController.getAllUsers);

module.exports = router;