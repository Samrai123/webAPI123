const mongoose = require('mongoose');

const visualSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true,
    trim: true,
},
description: {
        type: String,
        required: true,
        trim: true,
    },
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'User'},
    category : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
   }],
   
   image:{
    type:String,
    required:true
   },
   like:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "VisualLike"
   }],
   
})
exports.Visual = mongoose.model("Visual",visualSchema);