import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import WorkspaceModel from '../models/Workspace.model.js';

const router = express.Router();

router.post('/',requireAuth,async(req,res)=>{
    try{
    const {name} = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const owner = req.userId;

    const newWorkspace = await WorkspaceModel.create({
        name : name,
        slug : slug,
        owner: owner,
        members:[{user : owner,
            role:'admin',
        }]
    });

    res.status(201).json({newWorkspace});
    }

    catch(err){
        res.status(500).json({ message: 'Server error' })
    }
   
    
});


router.get('/',requireAuth,async(req,res)=>{
    try{
        const workspaces = await WorkspaceModel.find({"members.user":req.userId});
        if(!workspaces){
            res.json({message:"No Workspaces found"});
        }
        else{
            res.json({workspaces});
        }
        
    }
    catch(err){
         res.status(500).json({ message: 'Server error' })
    }
})


router.get('/:workspaceId',requireAuth,async(req,res)=>{
    try{
    const workspace = await WorkspaceModel.findById(req.params.workspaceId);
    if(!workspace){
        res.status(404).json({message:"Workspace not found"});
    } 
    else{
        res.json({workspace});
    }
    }
    catch(err){
         res.status(500).json({ message: 'Server error' })
    }
   
});

export default router;
