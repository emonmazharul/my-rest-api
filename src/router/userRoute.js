const User = require('../models/user');
const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const sharp = require('sharp');
const {sendWelcomeEmail, sendGoneEmail} = require('../emails/account');

const router = new express.Router();

router.post('/users', async (req,res) => {
    const user = new User(req.body);
    try {
       await user.save();
       await sendWelcomeEmail(user.email,user.name);
       const token = await user.generateAuthToken();
       res.status(201).send({user,token})
    } catch(e){
       res.status(400).send(e);

    }
});

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await  user.generateAuthToken();
        res.status(200).send({user,token})
    } catch (e) {
        res.status(400).send({error: e});
    }
})

// router.post('/users/logout',auth, async (req,res) => {
//   try {
//       req.user.tokens = req.user.tokens.filter( (token) => token.token !== req.token);
//       await req.user.save();
//       res.send();

//   } catch (e) {
//       res.status(500).send();

//   } 
// })

router.post('/users/logout',auth,async (req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();

        res.send();

    } catch (e) {
        res.status(500).send();

    }
})

router.post('/users/logoutAll', auth, async (req,res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();

    } catch (e) {
        res.status(500).send();

    }
})


router.get('/users/me', auth , async (req,res) => {
    try {
        res.send(req.user);

    } catch (e){
        res.status(500).send();

    }
   
  
})

router.get('/users/:id', async (req,res) => {
    const _id = req.params.id;
    try{
        const specificUser =  await User.findById({_id,});
        if(!specificUser){
            res.status(404).send();
        } else{
            res.status(200).send(specificUser);
        }

    } catch(e) {
        res.status(500).send(e);

    }

    
})

router.patch('/users/me', auth ,async (req,res) => {
    const allowedUpdate = ['name', 'age', 'password', 'email'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(item => {
        return allowedUpdate.includes(item);
    });

    if(!isValidOperation){
         return res.status(400).send({error: 'Invalid Update!'});
    }
    try {
        console.log(req.user);
        updates.forEach(item => req.user[item] = req.body[item])
        await req.user.save();
        res.send(req.user);

    } catch(e){
        res.status(400).send();

    }
})

router.delete('/users/me', auth , async (req,res) => {
    try{
        await req.user.remove();
        res.send(req.user);
        await sendGoneEmail(req.user.email, req.user.name); 

    } catch(e) {
        res.status(400).send(e);
    }

})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/) ) {
            return cb(new Error('please upload a jpg,png or jpeg file'))
        }
        cb(undefined,true);
    },
});

router.post('/users/me/avatar', auth ,upload.single('upload'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).png().resize({width: 250,height: 250}).toBuffer();
    req.user.avatar = buffer;
    await req.user.save(); 
    res.send({done: 'file successfully uploaded'});

}, (error,req,res,next) => {
    res.status(400).send({error: error.message});
});

router.delete('/users/me/deleteavatar', auth, async (req,res) => {
    try {
        const user = req.user;
        user.avatar = undefined;
        await req.user.save();

        res.send(req.user);

    } catch (e) {
        res.status(404).send(e);

    }
})

router.get('/users/:id/avatar',async (req,res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if(!user || !user.avatar) {
            throw new Error('')
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);

    } catch(e) {
        res.status(404).send();
    }
})


module.exports = router;