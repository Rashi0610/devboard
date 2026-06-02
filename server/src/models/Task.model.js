import mongoose from 'mongoose';

const taskModel = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    column:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Column',
        required:true
    },
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project',
        required:true
    },
    assignee:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
       
    },
    priority:{
        type:String,
        enum:['low', 'medium', 'high', 'urgent'],
        default:'medium',
        
    },
    labels:[{
        type:String,
        default:[]
    }],
    position:{
        type:Number,
        
    },
    dueDate:{
        type:Date,
    },
    storyPoints:{
        type:Number,
        default:0
    },
    githubPrUrl:{
        type:String
    }
},
{timestamps:true}
);

export default mongoose.model("Task",taskModel)