const mongoose=require('mongoose');
const bcrypt = require('bcryptjs');
const schema = new mongoose.Schema({
    visual_id:{
        type: mongoose.Schema.Types.ObjectId,ref:"Visual"
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,ref:"User"
    }
});
const VisualLike = mongoose.model('VisualLike',schema)
module.exports = VisualLike;