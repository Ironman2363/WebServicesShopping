const Admin = require('../molde/Admin')
const product = require("../molde/product")
const typeProduct = require("../molde/TypeProduct")
const express = require('express')
const session = require('express-session');
const multer = require("multer");
const jimp = require("jimp")
const path = require('path');
var jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const TypeProduct = require('../molde/TypeProduct');

const app = express()
app.use(bodyParser.json())
app.use(session({
    secret: 'sassa2',
    resave: true,
    saveUninitialized: true
}));

app.use(express.json())
app.use(cookieParser());

// update image
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

function verifyToken(req, res, next) {
    const token = req.cookies.token;
    // console.log(token)
    if (!token) {
        return res.redirect('/admin/loginAdmin');
    }

    jwt.verify(token, "secret", function (err, decoded) {
        if (err) {

            return res.redirect('/admin/loginAdmin');
        }
        // console.log("Verified "+decoded);
        next();
    });
}

app.get('/getAllTypeProducts', verifyToken, async (req, res) => {
    try {
        await TypeProduct.find()
            .then(item => {
                res.render("managerLoaiSP", {
                    typeProduct: item.map(ite => ite.toJSON())
                })
            })
    } catch (error) {
        console.log(error)
    }
})

app.get("/deleteProduct/:id", verifyToken, async (req, res) => {
    await TypeProduct.findOneAndDelete({ _id: req.params.id }).
        then(() => res.redirect("/typeProductAdmin/getAllTypeProducts"))
})

app.get("/moveAddTypeSP", verifyToken, (req, res) => {
    res.render("addTypeSP")
})

app.post("/addTypeSP", upload.single("image"), async (req, res) => {
    try {
        const product_type = req.body.product_type
        const imagePath = req.file.path;
        const image = await jimp.read(imagePath);
        const base64Image = await image.getBase64Async(jimp.AUTO);

        const loaiSP = new TypeProduct({ product_type: product_type, image: base64Image })
        await loaiSP.save();
        res.redirect("/typeProductAdmin/getAllTypeProducts")
    } catch (error) {
        console.log(error)
    }
})

app.get("/editProduct/:id", async (req, res) => {
    try {
        const item = await TypeProduct.findById({_id:req.params.id})
        res.render("updateTypeSP", {
            loaiSP: item.toJSON()
        })
    } catch (error) {
        console.log(error)
    }

})

app.put("/udpateLoaiSP/:id",upload.single("image"),async (req, res) =>{
    try {
        const product_type = req.body.product_type;
        if(req.file && req.file.path){
            const imagePath = req.file.path;
            const image = await jimp.read(imagePath);
            const base64Image = await image.getBase64Async(jimp.AUTO);
            await TypeProduct.findByIdAndUpdate({_id:req.params.id},{
                product_type:product_type , image:base64Image
            }).then(() =>{
                 res.redirect("/typeProductAdmin/getAllTypeProducts")
            })
        }else{
            await TypeProduct.findByIdAndUpdate({_id:req.params.id},{
                product_type:product_type 
            }).then(() =>{
                 res.redirect("/typeProductAdmin/getAllTypeProducts")
            })
        }
    } catch (error) {
        console.log(error)
    }
})
module.exports = app;