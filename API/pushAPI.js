const Admin = require('../molde/Admin')
const product = require("../molde/product")
const express = require('express')
const session = require('express-session');
const multer = require("multer");
const jimp = require("jimp")
const path = require('path');
var jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

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


app.post('/dangkyAdmin', upload.single("image"), async (req, res) => {
   try {
      console.log(req.body)
      const email = req.body.email;
      const password = req.body.passWord;
      const name = req.body.name;
      const date = req.body.date;
      const role = req.body.role;
      const checkEmail = await Admin.findOne({ email: email })
      console.log(checkEmail)
      if (checkEmail) {
         const err = "Email đã tồn tại !"
         res.status(400).send(err)
         res.render("dangky", {
            error: err
         })
      } else {
            const user = new Admin(req.body)
            await user.save()
            res.json(user)
      }



   } catch (error) {
      console.log(error);
   }
});

app.get("/loginAdmin", async (req, res) => {
   res.render("login")
})


/// Admin
app.get('/', (req, res) => {
   res.render("dangky")
})
app.post('/login', async (req, res) => {
   try {
       console.log(req.body)
      const email = req.body.email;
      const pass = req.body.passWord;
      const user = await Admin.findOne({ email: email })
  
      if (user) {
         user.comparePassword(pass, function (err, isMatch) {
            if (isMatch && !err) {
               // const token = jwt.sign({_id : user._id},'secretkey')
               res.json(user);

            } else {
               console.log("sai pass word")
               const err = "Tai khoan không tồn tại !"
               res.status(400).send(err)
               return
            }
         })
         return
      }
      console.log("email khong ton tai")
      const err = "Tai khoan không tồn tại !"
      res.status(400).send(err)
   } catch (err) {
      res.status(500).send(err)
   }
})

// API login user 


// function verifyToken(req, res, next) {
//    const token = req.header('Authorization').replace('Bearer ', '')
//    const decoded = jwt.verify(token, 'secretkey');
//    req.user = decoded;
//     next();
// }

//API getAllUser mobile 
app.get("/getUsers", async (req, res) => {
   try {
      const users = await Admin.find();
      res.json(users);
   } catch (error) {
      console.log(error)
   }
})

app.get("/delete/:id", async (req, res) => {
   try {
      const u = await Admin.findByIdAndDelete(req.params.id, req.body)
      if (!u) {
         res.status(404).send("no items found")
      } else {
         res.status(200).redirect("/admin/getAllUsers")
      }
   } catch (error) {
      res.status(500).send(error);
   }
})

app.get("/edit/:id", async (req, res) => {
   try {
      await Admin.findById(req.params.id)
         .then(user => {
            res.render("editUser", {
               user: user.toJSON(),
            })
         })
   } catch (error) {
      console.log(error)
   }

})

app.put("/inserUsers/:id", upload.single("image"), async (req, res) => {
   Admin.updateOne({ _id: req.params.id }, req.body)
      .then(() => res.redirect("/admin/getAllUsers"))
      .catch(err => console.error(err))
})

app.get("/addUsers", (req, res) => {
   res.render("addUser", {
      titleView: "Inserter User",
   })
})
app.post("/inserUsers", upload.single("image"), async (req, res) => {
   try {
      const email = req.body.email; 
      const checkEmail = await Admin.findOne({ email: email })
      if (checkEmail) {
         const err = "Email đã tồn tại !"
         res.status(400).send(err)
         return
      }else{
         const user = new Admin(req.body)
         await user.save()
         res.json(user)
      }
     

   }
   catch (error) {
      res.status(500).send(error);
   }
})
app.get("/user", async (req, res) => {
   try {
      const user = Admin.find({})
      user.find({}).then(users => {
         res.render("managerUser", {
            users: users.map(user => user.toJSON())
         })
      })
   } catch (error) {
      console.log(error)
   }
})

app.get("/product", (req, res) => {
   res.redirect("/admin/getAllProducts")
})

//Product

app.get("/getAllProducts", (req, res) => {
   product.find({}).then(product => {
      res.render("managerProduct", {
         product: product.map(products => products.toJSON())
      })
   })
})

app.get("/addProduct", (req, res) => {
   res.render("addProduct", {
      titleView: "Inserter Products",
   })
})

app.post("/inserProduct", upload.single("image"), async (req, res) => {
   try {
      const code_product = req.body.code_product;
      const name_product = req.body.name_product;
      const price = req.body.price;
      const color = req.body.color;
      const id_KH = req.body.id_KH;
      const name_KH = req.body.name_KH;
      const type_product = req.body.type_product;
      if (req.file && req.file.path) {
         // thực hiện đoạn code khi có path
         const imagePath = req.file.path
         const img = await jimp.read(imagePath);
         const baseImage = await img.getBase64Async(jimp.AUTO)
         const sp = new product({
            code_product, name_product, price, color, id_KH, name_KH, type_product,
            image: baseImage
         });
         await sp.save();
         res.redirect('/admin/getAllProducts');
      } else {
         // thực hiện đoạn code khi không có path
         const sp = new product({
            code_product, name_product, price, color, id_KH, name_KH, type_product,
            image: ""
         });
         await sp.save();
         res.redirect('/admin/getAllProducts');
      }
   } catch (error) {
      res.status(500).render(error)
   }

})

app.get("/deleteProduct/:id", async (req, res) => {
   try {
      const ps = await product.findByIdAndDelete(req.params.id, req.body)
      if (!ps) {
         res.send("not found product")
      } else {
         res.redirect("/admin/getAllProducts")
      }
   } catch (error) {
      res.status(500).render(error)
   }

})

app.get("/editProduct/:id", async (req, res) => {

   try {
      await product.findById(req.params.id)
         .then((products) => {
            res.render("updateProduct", {
               titleView: "Update Product",
               products: products.toJSON()
            })
         })

   } catch (error) {
      res.status(500).render(error)
   }
})

app.put("/updateProduct/:id", upload.single("image"), async (req, res) => {
   const { code_product, name_product, price, color, id_KH, name_KH, type_product } = req.body;
   const imagePath = req.file.path;
   const image = await jimp.read(imagePath);
   const base64Image = await image.getBase64Async(jimp.AUTO);

   product.updateOne({ _id: req.params.id }, {
      code_product, name_product, price, color,
      id_KH, name_KH, type_product, image: base64Image
   })
      .then(() => res.redirect("/admin/getAllProducts"))
      .catch(err => console.error(err))
})


// search users 

app.get("/search", async (req, res) => {
   try {
      const name = req.query.search;
      console.log(name)
      const regex = new RegExp(name, "i");
      const users = await Admin.find({ name: regex });
      res.json(users);
   } catch (error) {
      res.status(500).send(error.message);
   }
});


// get Information user

app.get("/getInformation", async (req, res) => {
   try {
      const user = req.session.user;
      if (user) {
         res.render("informationUser", {
            user: user,

         })
      }

   } catch (error) {
      res.status(500).send(error.message);
   }

})

app.get("/editInformation/:id", async (req, res) => {
   try {
      console.log(req.body);
      const u = await Admin.findById(req.params.id)
      res.render("editInformation", {
         titleView: "Update Information",
         user: u.toJSON(),
      })
   } catch (error) {
      res.status(500).send(error);
   }

})

app.put("/updateInfor/:id", async (req, res) => {
   Admin.updateOne({ _id: req.params.id }, req.body)
      .then(() => {
         res.redirect("/admin/getAllInfor")
      })
      .catch(err => console.log(err))
})

app.get("/getAllInfor", async (req, res) => {
   try {
      const user = req.session.user;
      await Admin.findById({ _id: user._id })
         .then(user => {
            res.render("informationUser", {
               user: user.toJSON(),
            })
         })
   } catch (error) {
      res.status(500).send(error);
   }
})

// logout 
app.get('/logout', function (req, res) {
   res.clearCookie('token');
   res.redirect('/admin/loginAdmin');
});

module.exports = app;