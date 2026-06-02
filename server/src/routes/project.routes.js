import {Router} from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import projectModel from "../models/Project.model.js";


const router = Router();

router.post('/:workspaceId/projects',requireAuth,async(req,res)=>{
   try{
    const workspaceid = req.params.workspaceId;
    const {name,description} = req.body;

    const newProject = await projectModel.create({
        name:name,
        description:description,
        workspace:workspaceid,
        createdBy:req.userId,

    });
    res.status(201).json({newProject})
   }
   catch(err){
    res.status(500).json({Message:"Internal server error"});
   }
});

router.get('/:workspaceId/projects',requireAuth,async(req,res)=>{
    try{
        const workspaceid = req.params.workspaceId;
        const projects = await projectModel.find({workspace:workspaceid});
        if(!projects){
            res.json({message:"No projects found!"});
        }
        else{
            res.status(200).json({projects});
        }
    }
    catch(err){
        res.status(500).json({Message:"Internal server error"});
    }
});


router.delete("/:workspace/projects/:projectId",requireAuth,async(req,res)=>{
    try{
    const projectid = req.params.projectId;
    await projectModel.findByIdAndDelete(projectid);
    res.status(200).json({message:'project delted'});

    }
    catch(err){
         res.status(500).json({Message:"Internal server error"});
    }


})

export default router;