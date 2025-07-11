const db = require('../config/db');
const isAdmin = require('../middleware/authmiddleware');
const AddUser = require('../controllers/authController');

async function isUsersExisting(user_ids) {
    if (!Array.isArray(user_ids)) user_ids = [user_ids];
    if (user_ids.length === 0) return false;
    const result = await db.query(
        `SELECT id FROM users WHERE id = ANY($1::int[])`,
        [user_ids]
    );
    return result.rows.length === user_ids.length;
}


 async function isProjectExisting(project_id){
    const projectExist = await db.query(
        `SELECT id FROM projects WHERE id =$1`,
        [project_id]
    );
    return projectExist.rows.length > 0;
}



exports.addProject = async (req, res) => {
    try {
        const { name, description, start_date, end_date, user_ids } = req.body;

        if (!name || !description || !start_date || !end_date || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'All fields and at least one user are required.'
            });
        }

        if (!(await isUsersExisting(user_ids))) {
            return res.status(400).json({
                success: false,
                message: `One or more user IDs do not exist.`
            });
        }

        const newProject = await db.query(
            'INSERT INTO projects (admin_id, name, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, name, description, start_date, end_date]
        );
        const projectId = newProject.rows[0].id;

        for (const userId of user_ids) {
            await db.query(
                'INSERT INTO project_users (project_id, user_id) VALUES ($1, $2)',
                 [projectId, userId]);
        }

        res.status(201).json({
             success: true,
              message: 'Project added successfully.',
               data: newProject.rows[0] });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ success: false, message: 'Error creating project.' });
    }
};

exports.getprojects = async (req, res) => {
    try {
        const projects = await db.query(
            'SELECT * FROM projects'
        );
        const projectList = projects.rows;

        for (const project of projectList) {
            const users = await db.query(
                'SELECT u.id, u.name, u.surname, u.email FROM users u JOIN project_users pu ON u.id = pu.user_id WHERE pu.project_id = $1',
                [project.id]
            );
            project.user_ids = users.rows.map(u => u.id);
            project.users = users.rows;
        }

        res.status(200).json({ success: true, data: projectList });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ success: false, message: 'Error fetching projects.' });
    }
};
   
exports.updateProject = async (req, res) => {
    try {
        const { name, description, start_date, end_date, user_ids } = req.body;
        const { id } = req.params;

        if (!name || !description || !start_date || !end_date || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json({ success: false, message: 'All fields and at least one user are required.' });
        }

        await db.query(
            `UPDATE projects SET name = $1, description = $2, start_date = $3, end_date = $4 WHERE id = $5`,
            [name, description, start_date, end_date, id]
        );

        await db.query('DELETE FROM project_users WHERE project_id = $1', [id]);
        for (const userId of user_ids) {
            await db.query('INSERT INTO project_users (project_id, user_id) VALUES ($1, $2)', [id, userId]);
        }

        res.status(200).json({ success: true, message: 'Project updated successfully' });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!(await isProjectExisting(id))) {
            return res.status(404).json({
                 success: false, 
                 message: 'Project not found!'
                 });
        }
        const project = await db.query(
            `DELETE FROM projects WHERE id = $1 RETURNING id`,
            [id]
        );

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

exports.adduserproject = async (req, res) => {
    try {
        const { user_id, id } = req.params; 

        if (!(await isProjectExisting(id))) {
            return res.status(404).json({
                success: false,
                message: 'Project not found!'
            });
        }

        if (!(await isUserExisting(user_id))) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

        const exists = await db.query(
            'SELECT * FROM project_users WHERE project_id = $1 AND user_id = $2',
            [id, user_id]
        );
        if (exists.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this project.'
            });
        }

        await db.query(
            'INSERT INTO project_users (project_id, user_id) VALUES ($1, $2)',
            [id, user_id]
        );

        return res.status(200).json({
            success: true,
            message: 'User added to project successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while adding user to project'
        });
    }
};

exports.deleteUserproject = async (req, res) => {
    try { 
        const { user_id, id } = req.params;

        if (!(await isProjectExisting(id))) {
            return res.status(404).json({
                success: false, 
                message: 'Project not found!'
            });
        }

        if (!(await isUserExisting(user_id))) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found!'
            });
        }

        await db.query(
            'DELETE FROM project_users WHERE project_id = $1 AND user_id = $2',
            [id, user_id]
        );

        return res.status(200).json({
            success: true,
            message: `User from project deleted successfully`
        });

    } catch(error) {
        return res.status(500).json({
            success: false,
            message: `Server Error during deleting user from the project`
        });
    }
}
   
exports.getprojectUsers = async (req,res) => {
    try {
        const {id,user_id} = req.params;

        if(req.user.id !== id){
            return res.status(403).json({
                sucess:false,
                message:`You don't have access to this project`
            });

        }
        if (!(await isUserExisting(user_id))) {
            return res.status(404).json({
                 success: false,
                 message: 'User not found!' 
                });
        }
        
         if (!(await isProjectExisting(id))) {
           return res.status(404).json({ 
                 success: false, 
                 message: 'Project not found!' 
                 });
        }

        const userResult = await db.query (
            `SELECT users. * FROM users JOIN projects ON users.id = projects.user_id
            WHERE projects.id =$1`,
            [id]
        );

    } catch(error){
        return res.status(500).json({
            sucess:false,
            message:`Server Error during while fetching project user`
        })
    }
}

exports.isProjectExisting = isProjectExisting;
