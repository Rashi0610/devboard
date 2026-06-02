import mongoose from "mongoose";

const columnModel = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project',
        required:true
    },
    position:{
        type:Number,
        required:[true,"ordering columns left to right"]
    },
    color:{
        type:String,
        default:'#6366f1'
    },
    wipLimit:{
        type:Number,
        default:0
    },
},

{timestamps:true}


)


export default mongoose.model("Column",columnModel);