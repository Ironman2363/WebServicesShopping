const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const product = new Schema({
    name_product : String,
    price : Number,
    image : String,
    description : String,
    review : Number,
    sold: Number,
    typeProductID:String,
  });

module.exports = mongoose.model("product",product);