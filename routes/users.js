const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1/campusdairy');

const userSchema = mongoose.Schema({
  username:String,
  password:String,
  email:String,
  profileimage:String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'posts'
  }]
});

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);