import mongoose from 'mongoose'

const githubIntegrationSchema = new mongoose.Schema({
    repoOwner:{
        type:String,
        required:[true, "e.g. Rashi0610"]
    },
    repoName:{
        type:String,
        required:[true, "e.g. shipyard-demo"]
    },
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project',
        required:[true]
    },
    defaultColumnId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Column',
        required:[true]
    },
    doneColumnId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Column',
  required: true
}
},
{timestamps: true})

export default mongoose.model("GithubIntegration",githubIntegrationSchema);