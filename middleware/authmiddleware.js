const jwt = require("jsonwebtoken");

const authenticate =(req, res, next) =>{
    const token =req.header("Authorization")?.replace("Bearer", " ");
    if(!token){
        return res.status(401).json({ message : "Access denied. No token provided"})
    }

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decode.id;
    req.user = {_id: decode.id};
    next();
  } catch(error){
    res.status(401).json({message: "Invalid or expired token."});
 }
};

module.exports =authenticate;