const mongoose = require('mongoose');
const typeProduct = new mongoose.Schema({
    product_type : String,
    image : String,
})

module.exports = mongoose.model("typeProduct", typeProduct)