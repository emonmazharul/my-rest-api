const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_ATLAS_URL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,

});



