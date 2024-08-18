const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1/campusdairy');

const userSchema = mongoose.Schema({
  username:{ type: String, required: true, unique: true },
  password:{ type: String, required: true },
  email:{ type: String, required: true },
  is_online:{
    type:String,
    default:'0'
  },
  profileimage:String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'posts'
  }],
  
},{timeStamps:true}
);

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);