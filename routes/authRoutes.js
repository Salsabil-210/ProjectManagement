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
const { authenticateToken, isAdmin } = require('../middleware/authmiddleware');
const userController = require('../controllers/authController');

router.post('/register', validateRegistration, userController.register);

router.post('/login', validateLogin ,userController.loginUser);
router.post('/logout', authenticateToken ,userController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-reset-code', userController.verifyResetCode);
router.post('/addUser', authenticateToken, isAdmin, userController.addUser);
router.post('/set-new-password', userController.setNewPassword);
router.get('/profile', authenticateToken, userController.getProfile);
router.put("updateUser/:id",authenticateToken,userController.updateUser);

router.put('/profile', authenticateToken, validateProfileUpdate, userController.updateUser);
router.put('/change-password', authenticateToken, validateChangePassword, userController.changePassword);

router.get('/all', authenticateToken, isAdmin, userController.getAllUsers);

module.exports = router;