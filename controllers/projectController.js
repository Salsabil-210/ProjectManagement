//  exports.addproject = async (req,res) => {
//      try {
//          const{name, description, } = req.body

//    const newproject = await db.query(
//    `INSERT INTO projects(name,description)
//     VALUES($1,$2)
//     RETURNING id,name,description`,
//     [name,description]
//   );

//   const token =newproject.rows[0];
  
//   res.status(201).json({
//     sucess:true,
//     message:`Project added sucessfully`,
//     data: project,
//     token
//   });
// }catch(error) {
//   console.log('Creating project error:', error);

//   res.status(500).json({
//     sucess:false,
//     message:'Error creating the project'
//   });
// }      
// }


//    exports.getproject = async(req,res) =>{
//      try {
//       const {name, description} = req.body;

//       const isproject= await db.query(
//       `SELECT * FROM project WHERE name And description =$1 and $2`,
//       [name,description]
//       );
     
//       if(isproject.rows.length === 0){
//          return res.status(401).json({
//           sucess:false,
//           message: `there is no project like this `
//          });
//       }
    
//      }
//     };


   