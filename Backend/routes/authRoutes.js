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
router.post('/set-new-password', userController.setNewPassword);

router.post('/addUser', authenticateToken, isAdmin, userController.addUser);
router.put("/updateUser/:id", authenticateToken, isAdmin, userController.updateUsers);
router.delete('/deleteUser/:userId', authenticateToken, isAdmin, userController.deleteUser);
router.get('/all', authenticateToken, isAdmin, userController.getAllUsers);

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken,isAdmin, validateProfileUpdate, userController.updateUsers);
router.put('/change-password', authenticateToken, validateChangePassword, userController.changePassword);
router.get('/profile', authenticateToken, userController.getProfile);

module.exports = router;