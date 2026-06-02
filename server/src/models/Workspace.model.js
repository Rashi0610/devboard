import mongoose from 'mongoose';

const workSpaceModelSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' ,
        required:[true,"Who created it??"]
    },
    members: [
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin','member','viewer'], default: 'member' }
  }
],
    plan:{
        type:String,
        enum : ['free','pro'],
        default: 'free'
    },
}, {timestamps:true}

);


export default mongoose.model("Workspace",workSpaceModelSchema);