import {Router} from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import TaskModel from "../models/Task.model.js"
const router = Router();

router.post("/:columnId/tasks",requireAuth,async(req,res)=>{
    try{
    const {title,githubPrUrl,description, priority,assignee,labels, dueDate, storyPoints,projectId} = req.body;
    const columnId = req.params.columnId;
    const position = await TaskModel.countDocuments({column:columnId});

    const task = await TaskModel.create({
       title:title,
       description:description,
       column:columnId,
       project:projectId,
       assignee:assignee,
       createdBy:req.userId,
       priority:priority,
       labels: labels || [],
       position:position,
       dueDate:dueDate,
       storyPoints:storyPoints,
       githubPrUrl:githubPrUrl

    });
    
    res.status(201).json({task});
    }

    catch(err){
        res.status(500).json({message:"inetrnal server error"});

    }

});


router.get("/:columnId/tasks",requireAuth,async(req,res)=>{
    try{
        const tasks= await TaskModel.find({column:req.params.columnId}).sort({position:1});
        res.status(200).json({tasks});
    }
    catch(err){
        res.status(500).json({message:"inetrnal server error"});

    }
})

router.patch('/:columnId/tasks/:taskId',requireAuth,async(req,res)=>{
   try{
    const { columnId, taskId } = req.params;
    const task = await TaskModel.findByIdAndUpdate(
    taskId,      
    req.body,   
    { new: true } 
    );
    res.status(200).json({task});

   }
   catch(err){
        res.status(500).json({message:"inetrnal server error"});

    }
});


router.delete( "/:columnId/tasks/:taskId",requireAuth,async(req,res)=>{
   try{
    await TaskModel.findByIdAndDelete(req.params.taskId);
    res.status(200).json({message:"Task deleted"});
   }
    catch(err){
    res.status(500).json({message:"inetrnal server error"});
    }
});

export default router;