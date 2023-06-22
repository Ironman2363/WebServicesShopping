const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    image:String,
    email: String,
    name: String,
    password:String,
   
  });
module.exports = mongoose.model("users",user);