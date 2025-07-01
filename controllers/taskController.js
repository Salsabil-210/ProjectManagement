const db = require =('../config/db');


async function isUserExisting (user_id){
   const userExist= await db.query(
    `SELECT id FROM users WHERE id = $1`,
    [user_id]
   );
   return userExist.length > 0;
}

async function isTaskExist (task_id){
    const taskExist = await db.query(
        `SELECT id from tasks WHERE id =$1`
        [task_id]
    );
    return taskExist.length > 0;
}

exports.addtask = async (req,res) => {
    try{
     const { name, status, start_date, end_date, user_id  } = req.body;

     if (!name || !start_date || !end_date || !user_id) {
        return res.status(400).json({
            success: false,
            message: 'name , startdate , end date ,and user is required'
        });
    }
     if(!(await isUserExisting(user_id))) {
         return res.status(404).json({
            sucess:false,
            message:'User Not found!'
         });
     }

     const newtask = await db.query(
        `INSERT INTO tasks (admin_id, name , status ,is_completed , start_date,end_date,user_id,project_id) 
        VALUES ($1, $2 , $3 ,$4 ,$5 , $6 ,$7) RETURNING *`,

        [name, status ,start_date , end_date, user_id , id ,project_id]
     );

    return res.status(201).jon({
        sucess:true,
        message:`Task Created Successfully`
    });

    }
    catch(error){
    return res.status(500).json({
        sucess:false,
        message:`Server Error During adding task,please try agian later`
    });
    }
}