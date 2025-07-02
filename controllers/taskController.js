const db = require('../config/db');
const { isProjectExisting } = require('../controllers/projectController');

async function isUserExisting(user_id) {
    const result = await db.query(
        `SELECT id FROM users WHERE id = $1`,
        [user_id]
    );
    return result.rows.length > 0;
}

async function isTaskExist(task_id) {
    const result = await db.query(
        `SELECT id FROM tasks WHERE id = $1`,
        [task_id]
    );
    return result.rows.length > 0;
}

exports.addTask = async (req, res) => {
    try {
        const { name, status , start_date, end_date, user_id, project_id , is_completed} = req.body;

        if (!name || !start_date || !end_date || !user_id) {
            return res.status(400).json({
                success: false,
                message: 'name, start_date, end_date, and user_id are required.'
            });
        }

        const userExists = await isUserExisting(user_id);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

        const projectExists = await isProjectExisting(project_id)
          if(!projectExists){
             return res.status(404).json({
                sucess:false,
                message:'project Not found to add!'
             });
          }

        const newTask = await db.query(
            `INSERT INTO tasks (admin_id,name, status, is_completed, start_date, end_date, user_id, project_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7 ,$8)
             RETURNING *`,
            [req.user.id,name, status, is_completed, start_date, end_date, user_id, project_id ]
        );

        return res.status(201).json({
            success: true,
            message: 'Task created successfully.',
            data: newTask.rows[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error while adding task.'
        });
    }
};

exports.getTask = async (req, res) => {
    try {
        const { task_id } = req.params;


        if (!(await isUserExisting(user_id))) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

        if (!(await isTaskExist(task_id))) {
            return res.status(404).json({
                success: false,
                message: 'Task not found!'
            });
        }

        const task = await db.query(
            `SELECT id, name, status, is_completed, start_date, end_date, user_id, project_id 
             FROM tasks 
             WHERE id = $1 AND user_id = $2`,
            [task_id, user_id]
        );

        return res.status(200).json({
            success: true,
            data: task.rows[0] 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching task.'
        });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status, is_completed, start_date, end_date, user_id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Task ID is required in params.'
            });
        }
        if(!(await isUserExisting(user_id))){
            return res.status(404).json({
                sucess:false,
                message:`The User Not found !`
            });
        }

        if (!(await isTaskExist(id))) {
            return res.status(404).json({
                success: false,
                message: 'Task not found!'
            });
        }

        const updatedTask = await db.query(
            `UPDATE tasks
             SET name = $1, status = $2, is_completed = $3, start_date = $4, end_date = $5, user_id = $6
             WHERE id = $7
             RETURNING *`,
            [name, status, is_completed, start_date, end_date, user_id, id]
        );

        return res.status(200).json({
            success: true,
            message: 'Task updated successfully.',
            data: updatedTask.rows[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating task.'
        });
    }
};

exports.deleteTask = async (req,res) =>{
    try{
        const {id} = req.params;
        
        if(!(await isTaskExist(id))){
            return res.status(404).json({
                sucess:false,
                message:`Task Not found !`
            });
        }

        const task = await db.query(
            `DELETE FROM tasks WHERE id = $1 RETURNING id`,
            [id]
        );

        res.status(200).json({
            sucess:true,
            message:`Task Deleted Successfully`
        });

    }catch(error){
    console.error('Error Deleting the task',error);
    res.status(500).json({
        sucess:false,
        message:`Server Error During deleting task`
    });
    }
}

exports.userStatustask = async (req, res) => {
    try{
        
     const{ id } =req.params;
    const{task_status} = req.body;

    if(!req.user && !req.user.task){
       return res.status(403).json({
        sucess:false,
        message:`You are Not related to this project`
       });
    }
    const statususer = await db.query(
        `INSERT INTO tasks (task_status)  VALUES($1) RETURNING *`,
        [task_status]
    );

return res.status(201).json({
    sucess:true,
    message:` USer Status Updated Successfully`
});
 } catch(error){
   console.error(error);
   return res.status(500).json({
    sucess:false,
    message:`Server Error `
   })
    }
};

exports.updatesUsertatus = async(req,res) =>{
 try{
  const{id}=req.params;
  const{task_status} = req.body;
   
  if(!req.user && req.user.task){
    return res.status(403).json({
        sucess:false,
        message:`You are not related to this task`
    });
  }
  if(!(await isTaskExist(task_id))){
    return res.status(404).json({
        sucess:false,
        message:`Task Not found!`
    });
  }

  const status = await db.query(
    `UPDATE tasks SET status =$1 WHERE id =$2 `,
    [status]
  );

 }catch(error){
    console.error(error);
    return res.status(500).json({
      sucess:false,
      message:`Server Error`
    });

    
 }
}



