const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1/campusdairy');

const userPosts = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    image:{
        type:String,
    },
    text:{
        type:String,
        required:true
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the current date and time when a document is created
    },
    updatedAt: {
        type: Date,
        default: Date.now // Automatically set the current date and time when a document is created or updated
    }
});

userPosts.plugin(plm);

module.exports = mongoose.model('posts', userPosts);