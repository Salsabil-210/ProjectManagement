const db = require('../config/db');
const isAdmin = require('../middleware/authmiddleware');
const AddUser = require('../controllers/authController');


exports.addProject = async (req, res) => {
    try {
        const { name, description, start_date, end_date, user_id } = req.body;

        if (!name || !description || !start_date || !end_date || !user_id) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }


        const existingUser = await db.query(
            'SELECT id FROM users WHERE id = $1',
            [user_id]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

        const newProject = await db.query(
            'INSERT INTO projects (admin_id, name, description, start_date, end_date, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, name, description, start_date, end_date, user_id]
        );

        return res.status(201).json({
            success: true,
            message: 'Project added successfully.',
            data: newProject.rows[0]
        });
    } catch (error) {
        console.error('Server Error creating the project:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating the project.'
        });
    }
};

exports.getprojects = async (req, res) => {
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
    try {
        const { name, description, start_date, end_date, user_id } = req.body;
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

        const existingUser = await db.query(
            'SELECT id FROM users WHERE id = $1',
            [user_id]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }


        const updatedProject = await db.query(
            `UPDATE projects
             SET name = $1, description = $2, start_date = $3, end_date = $4, user_id = $5
             WHERE id = $6
             RETURNING *`,
            [name, description, start_date, end_date, user_id, id]
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


exports.deleteUserproject = async (req,res) => {


    if (!req.user || !req.user.isAdmin){
        return res.status(403).json({
           sucess:false,
           message:`you Don't Have access to delete user from projects`
        });
        }

    try { 
     const {userid,id} = req.params;

     const project = await db.query(
        `SELECT id FROM projects WHERE id =$1 AND user_id =$2`
        [id, userid]
     );

     if(project.rows.length === 0){
        return res.status(404).json({
            sucess:false,
            message:`No such a project like this`
        });
     }

     

      if(existingUser.rows.length === 0){
           return res.status(404).json({
            sucess:false,
            message: `User Not Found`
           });
      }

    //  const project = await db.query(
    //     `DELETE user_id FROM projects WHERE user_id = $1 RETURNING id`,
    //     [userid]
    
    //  );

     return res.status(200).json({
        sucess:true,
        message:`User from project Deleted successfully`
    });

    }

    catch(error){
     return res.status(500).json({
        sucess:false,
        message:`Server Error During deleting user from the project`
     });
    }
}
   