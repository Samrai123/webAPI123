const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true,
    },
    lname: {
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        trim: true,
    },
    image:{
        type: String,
    },

    username: {
        type: String,
        required: true,
        trim: true,
    },
    password:{
        type: String,
        required: true,
        trim: true,
    },
    
   category : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
   }],
});

exports.User = mongoose.model("User", userSchema);