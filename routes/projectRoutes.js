const express = require("express");
const router = express.Router();

const projectController = require ('../controllers/projectController');
const { authenticateToken, isAdmin } = require('../middleware/authmiddleware');

router.post('/addprojects', authenticateToken, isAdmin, projectController.addProject);
router.get('/getprojects/:id', authenticateToken, isAdmin, projectController.getprojects);
router.put('/updateprojects/:id', authenticateToken, isAdmin, projectController.updateProject);
router.delete('/deleteprojects/:id', authenticateToken, isAdmin, projectController.deleteProject);

module.exports = router;