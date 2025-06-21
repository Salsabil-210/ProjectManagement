const express = require("express");
const router = express.Router();


const { 
    validateRegistration, 
    validateLogin, 
    validatePasswordReset, 
    validateNewPassword, 
    validateProfileUpdate, 
    validateChangePassword 
} = require('../util/validation');
const { authenticateToken, requireAdmin } = require('../middleware/authmiddleware');
const userController = require('../controllers/userController');

router.post('/register', validateRegistration, userController.register);

router.post('/login', validateLogin, userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-reset-code', userController.verifyResetCode);
router.post('/set-new-password', userController.setNewPassword);

router.get('/profile', authenticateToken, userController.getProfile);


router.put('/profile', authenticateToken, validateProfileUpdate, userController.updateProfile);
router.put('/change-password', authenticateToken, validateChangePassword, userController.changePassword);

// Admin-only routes
router.get('/all', authenticateToken, requireAdmin, userController.getAllUsers);

module.exports = router;