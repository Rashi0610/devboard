import mongoose from "mongoose";

const userModelSchema = new mongoose.Schema({
    name:{
        type:String,
       
    },
    email:{
        type:String,
       
    },
    avatar_url:{
        type:String,
       
    },
    github_id:{
       type:String,
        required:true,
        unique:true
    },
    github_access_token:{
        type:String,
        required:true
    }
},
    {
        timestamps:true
    }
)

export default mongoose.model("user",userModelSchema);