const express = require('express');
const jwl = require('jsonwebtoken');
require('./db/mongoose');
const userRouter = require('./router/userRoute');
const taskRouter = require('./router/taskRoute');


const app = express();

const port = process.env.PORT;


app.use(express.json());
app.use(userRouter);
app.use(taskRouter);
app.listen(port, () => console.log('server running on up to ' + port));

