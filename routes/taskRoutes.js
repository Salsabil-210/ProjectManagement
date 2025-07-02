const express = require("express");
const router = express.Router();

const { authenticateToken, isAdmin } = require('../middleware/authmiddleware');
const taskcontroller = require("../controllers/taskController");

router.post("/addtask", authenticateToken, isAdmin, taskcontroller.addTask);
router.get("/gettask/:id",authenticateToken, taskcontroller.getTask);
router.put("/updatetask/:id", authenticateToken, isAdmin, taskcontroller.updateTask);

module.exports = router;