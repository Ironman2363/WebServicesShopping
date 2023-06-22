const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cart = new Schema({
    ID_Product : String,
    name_product : String,
    price : Number,
    image : String,
    description : String,
    review : Number,
    sold: Number,
    typeProductID:String,
    soLuong: Number,
    ID_KH : String,
  });

module.exports = mongoose.model("cart",cart);