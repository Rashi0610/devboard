import {Router} from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import ColumnModel from "../models/Column.model.js"
import ProjectModel from "../models/Project.model.js"

const router = Router();

router.get('/:projectId/info', requireAuth, async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.projectId)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json({ project })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/:projectId/columns',requireAuth,async(req,res)=>{
    try{
    const{name,color} = req.body;
    const projectId = req.params.projectId;
    const position =  await ColumnModel.countDocuments({ project: projectId })

    const column = await ColumnModel.create({
        name:name,
        project:projectId,
        position:position,
        color:color,
    })

    res.status(201).json({column});
    }
    catch(err){
        res.status(500).json({err});
    }

});

router.get('/:projectId/columns',requireAuth,async(req,res)=>{
    try{
    const column = await ColumnModel.find({project:req.params.projectId}).sort({position:1});
     res.status(200).json({column});
    }
    catch(err){
        res.status(500).json({Message:"internal server error"});
    }
});

router.delete("/:projectId/columns/:columnId",requireAuth,async(req,res)=>{
    try{
        await ColumnModel.findByIdAndDelete(req.params.columnId);
        res.status(200).json({message:"Column deleted"});
    }
     catch(err){
        res.status(500).json({Message:"internal server error"});
    }

});



export default router;