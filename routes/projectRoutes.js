const express = require("express");
const router = express.Router();

const projectController = require ('../controllers/projectController');
const { authenticateToken, isAdmin } = require('../middleware/authmiddleware');
const { projectSchema } = require('../util/projectValidations');
const {validate} = require('../middleware/validation');

router.post('/addprojects', authenticateToken, isAdmin, validate(projectSchema), projectController.addProject);
router.get('/getprojects', authenticateToken, isAdmin, projectController.getprojects);
router.put('/updateprojects/:id', authenticateToken, isAdmin, validate(projectSchema), projectController.updateProject);
router.delete('/deleteprojects/:id', authenticateToken, isAdmin, projectController.deleteProject);
router.get('/getprojectUsers/:id', authenticateToken, projectController.getprojectUsers);

module.exports = router;