const mongoose = require('mongoose');
require('colors');
// Mongoose will ensure that only the fields that are specified in your Schema will be saved in the database,
// and all other fields will not be saved
mongoose.set('strictQuery',true);
const connectDB = async () => {
    const conn = mongoose.connect('mongodb://127.0.0.1:27017/lokbook')
    .then(()=>{
        console.log('connection established to mongodb')
    }).catch((err)=>console.log(err))
  };
  
  module.exports = connectDB;
  