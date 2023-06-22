const jimp = require("jimp")
const path = require('path');
var jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express')
const Product = require("../molde/product")
const session = require('express-session');
const multer = require("multer");
const typeProduct = require("../molde/TypeProduct");
const TypeProduct = require("../molde/TypeProduct");
const app = express();
app.use(bodyParser.json())
app.use(express.json())
app.get('/getAllTypeProduct', async (req, res) => {
    await typeProduct.find().
        then(item => res.json(item))
        .catch(err => console.error(err))
})

app.post("/getAllProduct", async (req , res) =>{
    try {
        const id = req.body.id;
        const getAll = await Product.find({typeProductID:id})
        res.json(getAll);
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
})


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // tên file
    }
});


const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // giới hạn kích thước file tải lên là 2MB
});

app.post("/addTypeProduct", upload.single("image"), async (req, res) => {
    try {
        console.log(req.body)
        const typeName = req.body.product_type;
        const image = req.body.image;
        const typeProductID = req.body.typeProductID;
        const checkMa = await TypeProduct.findOne({typeProductID:typeProductID})
        if(checkMa){
            const err = "Ma da ton tai"
            res.status(402).send(err)
            // console.log("ma da ton tai")
            return
        }
        const typeSP = new typeProduct({ product_type: typeName, image: image , typeProductID:typeProductID})
        await typeSP.save()
        res.send("them thanh cong")
    } catch (error) {
        console.log(error)
    }
})

app.put("/updateTypeProduct/:id",upload.single("image"), async (req, res) => {
    try {
        const typeName = req.body.product_type;
        const image = req.body.image;
        await typeProduct.findOneAndUpdate({ _id: req.params.id },{
            product_type: typeName, image: image
        })
        .then(() => res.send("update thanh cong"))
    } catch (error) {
        console.log(error)
    }
})

app.get("/deleteTypeProduct/:id", async (req, res) => {
    try {
         await typeProduct.deleteOne({ _id: req.params.id })
         .then(()=>{ res.send("xoa thanh cong") })
    } catch (error) {
        console.log(error)
    }
   
})
module.exports = app