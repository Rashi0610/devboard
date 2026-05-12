import jwt from "jsonwebtoken";

export const requireAuth= (req,res,next)=>{
    const token = req.cookies.accessToken;
    if(!token){
        return res.status(401).json({message:"no token provided"});
    }
    else{
        try{
            const decoded = jwt.verify(token,process.env.JWT_SECRET);
            req.userId = decoded.userId
            next();

        }
        catch(err){
             return res.status(401).json({ message: "Invalid token" });
        }
    }
};