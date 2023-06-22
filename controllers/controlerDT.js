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



 app.get("/getDoanhThu", async (req, res) => {
   try {
    const listOrder =  await order.find({ status: "da nhan" })
    const monthlyRevenue = calculateMonthlyRevenue(listOrder)
    res.json(monthlyRevenue)
   } catch (error) {
     console.log(error)
   }
})
 app.get("/getDoanhThuServer", async (req, res) => {
   try {
    const listOrder =  await order.find({ status: "da nhan" })
    const monthlyRevenue = calculateMonthlyRevenue(listOrder)
    res.render("doanhThu/managerDT",{monthlyRevenue})
   } catch (error) {
     console.log(error)
   }
})

app.get("/getTongDoanhthu" ,async(req , res) =>{
   try {
      const listOrder =  await order.find({ status: "da nhan" })
      const monthlyRevenue = calculateMonthlyRevenue(listOrder)
      let listMoney = Object.values(monthlyRevenue)
      let sum = listMoney.reduce((tong, item) => tong + item, 0)
      const tongTien = sum.toLocaleString('vi-VN');
      res.json(tongTien)
   } catch (error) {
      console.log(error)
   }
})

 // Hàm tính tổng doanh thu hàng tháng
 function calculateMonthlyRevenue(listOrder) {
    const monthlyRevenue = {};
 
    listOrder.forEach(order => {
       const orderDate = new Date(order.date);
       const month = orderDate.getMonth() + 1; // Tháng bắt đầu từ 0, cần +1 để đúng tháng thực tế
 
       if (!monthlyRevenue[month]) {
          monthlyRevenue[month] = 0;
       }
 
       monthlyRevenue[month] += order.tongTien;
    });
 
    return monthlyRevenue;
 }
 
module.exports = app;