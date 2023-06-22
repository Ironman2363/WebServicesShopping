const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const detailOrder = new Schema({
    ID_KH: String,
    ID_Address: String,
    nameSP: String,
    giaSP: String,
    soluongSP: String,
    image : String,
    tongTien : Number,
    status : String,
    sold: Number,
    date :Date,
});

module.exports = mongoose.model("detailOrder", detailOrder);