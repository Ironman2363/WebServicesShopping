const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const methods = require("method-override");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const cors = require("cors");
const http = require("http");
const API = require("./API/pushAPI");
const typeProduct = require("./API/controlerTypeProduct");
const typeProductAdmin = require("./controllers/controlerAdminLoaiSP");
const order = require("./controllers/controlerOrder");
const product = require("./API/controlerProduct");
const buyer = require("./API/controlerBuyer");
const address = require("./API/controlerAdderss");
const detailOrder = require("./API/controlerDetailOrder");
const doanhThu = require("./controllers/controlerDT");
const cart = require("./API/controlerCart");
const app = express();
app.use(cors());
app.use(flash());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.json());
app.use(methods("_method"));
app.use(express.static("image"));
// const server = http.createServer((req, res) => {
//     res.setHeader('Content-Type', 'application/json')
//     res.end(JSON.stringify({
//         success: true,
//     }))
// })

app.use(
  session({
    secret: "sassa2",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
const port = 9999;
const controllers = require("./controllers/controlersAdmin");
mongoose
  .connect("mongodb://127.0.0.1:27017/QuanLyBanHang")
  .then(function () {
    console.log("ket noi thanh cong !");
  })
  .catch(function (err) {
    console.log("error: " + err);
  });
app.engine(
  ".hbs",
  handlebars.engine({
    extname: "hbs",
    helpers: {
      sum: (a, b) => a + b,
    },
  })
);
app.set("view engine", ".hbs");
app.set("views", "./views");
app.use("/admin", controllers);
app.use("/typesProducts", typeProduct);
app.use("/product", product);
app.use("/buyer", buyer);
app.use("/address", address);
app.use("/detailOrder", detailOrder);
app.use("/cart", cart);
app.use("/typeProductAdmin", typeProductAdmin);
app.use("/doanhThu", doanhThu);
app.use("/order", order);
app.use(express.static("uploads"));
app.use("/api", API);
app.listen(port, function () {
  console.log("running port " + port);
});
