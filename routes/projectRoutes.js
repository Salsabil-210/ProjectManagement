const projectController = require ('../controllers/projectController');
const authenticate = require('../middleware/authmiddleware');

router.post('/addprojects/:id',authenticate,projectController.addProject);
router.get('/getprojects/:id',authenticate,projectController.getprojects);
router.put('updateprojects/:id',authenticate,projectController.updateProject);
router.delete('deleteprojects/:id',authenticate,projectController.deleteProject);