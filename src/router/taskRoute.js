const Task = require('../models/task');
const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');

router.post('/tasks', auth , async (req,res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    })

    try {
        await task.save();
        res.status(201).send(task)

    } catch(e){
        res.status(400).send(e)

    }
    
});

//Get //tasks?completed=true
// Get /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth , async (req,res) => {
    const match = {};
    const sort = {}
    if(req.query.completed) {
        match.completed = req.query.completed === 'true';

    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
            
        }).execPopulate();
        res.send(req.user.tasks);

    } catch(e) {
        console.log(e);
      res.status(501).send(e)

    }
})

router.get('/tasks/:id',auth, async (req,res) => {
    const _id = req.params.id;
    try{
     const task = await Task.findOne({_id, owner: req.user._id})
      if(!task){
          res.status(404).send()
      } else{
        res.status(200).send(task);
      } 

    } catch(e) {
        res.status(500).send(e)

    } 
})

router.patch('/tasks/:id',auth,async(req,res) => {
    const allowedTask = ['description', 'completed'];
    const updates = Object.keys(req.body);
    const allowedUpdate = updates.every(item => allowedTask.includes(item));
    if(!allowedUpdate){
        return res.status(400).send({error: 'Invalid Update!'});
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if(!task){
            res.status(404).send();
        } else{
            updates.forEach(item => task[item] = req.body[item]);
            await task.save()
            res.status(200).send(task);
        }

    } catch(e) {
        res.status(400).send(e)

    }
})

router.delete('/tasks/:id',auth ,async (req,res) => {
    try{
        const deletedTask  = await Task.findOne({_id: req.params.id, owner: req.user._id});
        console.log(req.params._id);
        if(!deletedTask){
            res.statu(404).send({error: 'invalid id!'});        
        } else{
            await deletedTask.remove();
            res.status(200).send(deletedTask);
        }

    } catch(e) {
        res.status(400).send(e);
    }

})

module.exports = router;