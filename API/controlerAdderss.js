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
const address = require("../molde/adres")
const app = express();
app.use(bodyParser.json())
app.use(express.json())
app.get('/getAllAddress', async (req, res) => {
    await address.find().
        then(item => res.json(item))
        .catch(err => console.error(err))
})

app.post("/themAddres", async (req, res) => {
    try {
        const addres = new address(req.body)
        await addres.save()
        res.send("them thanh cong")
    } catch (error) {
        console.log(error)
    }
})

app.put("/updateAddress/:id", async (req, res) => {
    try {
        await address.findOneAndUpdate({ _id: req.params.id },
            req.body
        )
        .then(() => res.send("update thanh cong"))
    } catch (error) {
        console.log(error)
    }
})

app.get("/deleteAddress/:id" ,async (req , res) =>{
    console.log(req.params.id)
   await address.findByIdAndDelete({_id:req.params.id})
    res.send("xoa thanh cong")
})

module.exports = app