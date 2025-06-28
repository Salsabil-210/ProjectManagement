const db = require('../config/db');
const isAdmin = require('../middleware/authmiddleware');
const AddUser = require('../controllers/authController');

exports.addProject = async (req, res) => {
    try {
        const { name, description, start_date, end_date, userid } = req.body;

        if (!name || !description || !start_date || !end_date || !userid) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: `You don't have access to add projects.`
            });
        }

        const existingUser = await db.query(
            'SELECT id FROM users WHERE id = $1',
            [userid]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

        const newProject = await db.query(
            'INSERT INTO projects (name, description, start_date, end_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, start_date, end_date, userid]
        );

        return res.status(201).json({
            success: true,
            message: 'Project added successfully.',
            data: newProject.rows[0]
        });
    } catch (error) {
        console.error('Error creating the project:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating the project.'
        });
    }
};

exports.getprojects = async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: "You don't have access to see projects"
        });
    }
    try {
        const projects = await db.query(
            'SELECT id, name, description, start_date, end_date, user_id FROM projects'
        );
        return res.status(200).json({
            success: true,
            data: projects.rows
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching projects.'
        });
    }
};
   
exports.updateProject = async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to update a project"
        });
    }
    try {
        const { name, description, start_date, end_date, userid } = req.body;
        const { id } = req.params; 

        const project = await db.query(
            'SELECT id FROM projects WHERE id = $1',
            [id]
        );

        if (project.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "There is no project like this to update"
            });
        }

        const updatedProject = await db.query(
            `UPDATE projects
             SET name = $1, description = $2, start_date = $3, end_date = $4, user_id = $5
             WHERE id = $6
             RETURNING *`,
            [name, description, start_date, end_date, userid, id]
        );

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: updatedProject.rows[0]
        });
    } catch (error) {
        console.error('Error updating the project:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.deleteProject = async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: `You are not authorized to delete this project`
        });
    }

    try {
        const { id } = req.params;

        const project = await db.query(
            `DELETE FROM projects WHERE id = $1 RETURNING id`,
            [id]
        );

        if (project.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Project not found to delete`
            });
        }

        return res.status(200).json({
            success: true,
            message: `Project deleted successfully`
        });
    } catch (error) {
        console.error(`Error deleting the project:`, error);
        return res.status(500).json({
            success: false,
            message: `Server error while deleting the project`
        });
    }
};
