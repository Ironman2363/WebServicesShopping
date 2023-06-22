const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adres = new Schema({
    address : String,
    ID_KH : String,
    name : String,
    phone : String,
  });

module.exports = mongoose.model("adres",adres);