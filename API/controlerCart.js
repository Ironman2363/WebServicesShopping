const jimp = require("jimp")
const path = require('path');
var jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express')
const session = require('express-session');
const multer = require("multer");
const cart = require("../molde/cart")
const detailOrder = require("../molde/detailOrder");
const typeProduct = require("../molde/TypeProduct")
const app = express();
app.use(bodyParser.json())
app.use(express.json())

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

app.post('/getAllCart', async (req, res) => {
    try {
        const list = await cart.find({ID_KH: req.body.id});
        const newList = await Promise.all(list.map(async (item) => {
            const typeProduct = await getTypeProductByID(item.typeProductID);
            return {
                productID: item._id,
                nameLoaiSP: typeProduct.map(item => item.product_type).join(),
                price: item.price,
                image: item.image,
                description: item.description,
                review: item.review,
                sold: item.sold,
                name_product: item.name_product,
                soLuong : item.soLuong
            };

        }));
        res.json(newList);
    } catch (error) {
        console.log(error);
    }
});


async function getTypeProductByID(typeProductID) {
    try {
        const typeSP = await typeProduct.find({ typeProductID: typeProductID });
       
        return typeSP;
    } catch (error) { 
        console.log(error);
    }
}



app.post("/addCart", upload.single("image"), async (req, res) => {
    try {
        const carts = new cart(req.body)
        const checkCarts = await cart.findOne({ID_Product: req.body.ID_Product, ID_KH:req.body.ID_KH})
        console.log(checkCarts)
        if (checkCarts) {
            console.log("ID da ton tai")
            checkCarts.soLuong +=1;
            await checkCarts.save();
        } else {
            await carts.save()
            res.send("them thanh cong")
        }
    } catch (error) {
        console.log(error)
    }
})

app.get('/deleteCart/:id', async (req, res) => {
    try {
        await cart.findByIdAndDelete(req.params.id)
        res.send("xoa thanh cong")
    } catch (error) {
        console.log(error)
    }
})

// app.put("/updateOrder/:id",upload.single("image"), async (req, res) => {
//     try {
//         await detailOrder.findOneAndUpdate({ _id: req.params.id },
//             req.body
//         )
//         .then(() => res.send("update thanh cong"))
//     } catch (error) {
//         console.log(error)
//     }
// })

module.exports = app