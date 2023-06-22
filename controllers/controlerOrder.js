const Admin = require('../molde/Admin')
const product = require("../molde/product")
const typeProduct = require("../molde/TypeProduct")
const order  = require("../molde/detailOrder")
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

app.get('/getAllOrderXacNhan' ,async (req , res) =>{
    try {
        await order.find({status:"xu ly"})
        .then(item => {
            res.render("order/managerOrderXacNhan",{
                listOrder: item.map(items => items.toJSON()),
            })
        })
    } catch (error) {
        console.log(error);
    }
})
app.get('/getAllOrderDangGiao' ,async (req , res) =>{
    try {
        await order.find({status:"dang giao"})
        .then(item => {
            res.render("order/managerOrder",{
                listOrder: item.map(items => items.toJSON()),
            })
        })
    } catch (error) {
        console.log(error);
    }
})

app.put("/updateOrder/:id",upload.single("image"), async (req, res) => {
    try {
        await order.findOneAndUpdate({ _id: req.params.id },
            req.body
        )
        .then(() => res.send("update thanh cong"))
    } catch (error) {
        console.log(error)
    }
})

app.get('/getAllOrderXuLy', async (req, res) => {
    try {
        list = await order.find({ status: "xac nhan"})
        if (list) {
            res.render("order/managerOrderXuLy",{
                listOrder: list.map(item => item.toJSON())
            })
        }
    } catch (error) {
        console.log(error)
    }
})
app.get('/getAllOrderDaNhan', async (req, res) => {
    try {
        list = await order.find({ status: "da nhan"})
        if (list) {
            res.render("order/managerOrderDaGiao",{
                listOrder: list.map(item => item.toJSON())
            })
        }
    } catch (error) {
        console.log(error)
    }
})
app.get('/getAllOrderDaHuy', async (req, res) => {
    try {
        list = await order.find({ status: "huy don"})
        if (list) {
            res.render("order/managerOrderDaHuy",{
                listOrder: list.map(item => item.toJSON())
            })
        }
    } catch (error) {
        console.log(error)
    }
})



module.exports = app;