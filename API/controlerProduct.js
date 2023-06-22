const jimp = require("jimp")
const path = require('path');
var jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express')
const session = require('express-session');
const multer = require("multer");
const product = require("../molde/product")
const typeProduct = require("../molde/TypeProduct");
const TypeProduct = require("../molde/TypeProduct");
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

app.get("/getAllProducts",async (req , res) =>{
  
        await product.find()
        .then(item => res.json(item))
        .catch(err => console.log(err))
})

app.post("/addProduct",upload.single("image") ,async (req , res) =>{
      try {
        console.log(req.body)
        console.log(req.body.image)
        const sp = new product(req.body)
        await sp.save()
        res.send("them thanh cong ")
      } catch (error) {
        console.log(error);
      }
})

app.get("/add" , async (req, res) => {
    try {
         await typeProduct.find()
        .then(item => res.json(item))
    } catch (error) {
        console.log(error);
    }
})

app.get("/getNameLSP", async (req, res) => {
   try {
      const idLSP = req.query.idLSP;
      const nameLSP = await TypeProduct.find({typeProductID: idLSP})
      res.json(nameLSP)
   } catch (error) {
    console.log(error);
   }
})

app.get("/deleteProduct/:id",async (req , res) =>{
    try {
        await product.findByIdAndDelete(req.params.id)
        .then(() => res.send("xoa thanh cong"))
    } catch (error) {
        console.log(error);
    }
})

app.put("/updateProduct/:id",upload.single("image"), async (req , res) =>{
     try {
        await product.findByIdAndUpdate({_id:req.params.id},req.body)
        .then(() =>{res.send("update thanh cong")})
     } catch (error) {
        console.log(error);
     }
})

app.get("/getTopSP", async (req , res) =>{
    try {
     const sp =  await product.find()
     const listSP = sp.sort((a ,b)=>{
         return b.sold - a.sold
     })
    const topSP =  listSP.slice(0, 7)
     res.json(topSP)
    
    } catch (error) {
        console.log(error);
    }
})

app.get("/searchProduct", async (req, res) => {
    try {
       const name = req.query.search;
       const sp = await product.find({ name_product: { $regex: name, $options: "i" } });
        res.json(sp);
    //    res.render("managerUser", { users: users.map(user => user.toJSON()) });
    } catch (error) {
       res.status(500).send(error.message);
    }
 });

 app.put("/updateSold/:id",async (req , res)=>{
   try {
      await product.findByIdAndUpdate({_id:req.params.id},{sold:req.body.sold})
      res.send("update thanh cong")
   } catch (error) {
      console.log(error);
   }
 })


module.exports = app;