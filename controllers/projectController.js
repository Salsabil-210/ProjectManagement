
// const isAdmin = require('../middleware/authmiddleware');
// const AddUser = require('../controllers/authController');

// exposrts.addProject = async (req,res) {
//     try{
       
//         const {name, description ,start_date, end_date ,userid} = req.body;

//         if(!req.user || !req.user.isAdmin){
//             return res.ststaus(403).json({
//                 sucess:false,
//                 message:`You Don't Have access to add Projects`
//             });
//         }
//          existingUser = await db.query (
//          `INSERT id FROM users where email = $1`,
//           [email]
//         );

//         const newProjects = await db.query(
//             `INSERT INTO projects (name,description,`
//         )

//        if(existing.rows.length === 0){
//         return res.status(404).json({
//             sucess:false,
//             message: `User Not Found !`
//         });
//        } catch(error){
//          res.status(500).json({
//             sucess:false,
//             message:`Error creating the projects `
//          })
//        }
//     }
// }
// //  exports.addproject = async (req,res) => {
// //      try {
// //  if(!is_admin.id){
// // res.status(401).json({
// //sucess:false,
// //message:`you sre not authorixed to add projects`,
// //
// //})          
// // if(is_admin.id){

// //   const{name, description, } = req.body
// //    const newproject = await db.query(
// //    `INSERT INTO projects(name,description)
// //     VALUES($1,$2)
// //     RETURNING id,name,description`,
// //     [name,description]
// //   );

// //   const token =newproject.rows[0];
  
// //   res.status(201).json({
// //     sucess:true,
// //     message:`Project added sucessfully`,
// //     data: project,
// //     token
// //   });
// // }catch(error) {
// //   console.log('Creating project error:', error);

// //   res.status(500).json({
// //     sucess:false,
// //     message:'Error creating the project'
// //   });
// // }      
// // }


// //    exports.getproject = async(req,res) =>{
// //      try {
// //       const {name, description} = req.body;

// //       const isproject= await db.query(
// //       `SELECT * FROM project WHERE name And description =$1 and $2`,
// //       [name,description]
// //       );
     
// //       if(isproject.rows.length === 0){
// //          return res.status(401).json({
// //           sucess:false,
// //           message: `there is no project like this `
// //          });
// //       }
    
// //      }
// //     };


   