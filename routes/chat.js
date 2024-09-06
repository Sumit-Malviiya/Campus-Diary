const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

// mongoose.connect('mongodb://127.0.0.1/campusdairy');

mongoose.connect('mongodb+srv://Sumit:KPiHx5ztfr34lnaj@sumitapp.wgfza6x.mongodb.net/?retryWrites=true&w=majority&appName=SumitApp');

const chatSchema =new mongoose.Schema({
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        require:true
    },
    receiver_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        require:true
    },
    message:{
        type:String,
        require:true,
    },
},{timeStamps:true}
);

chatSchema.plugin(plm);

module.exports = mongoose.model('chat', chatSchema);