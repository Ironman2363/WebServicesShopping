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
         if (req.file && req.file.path) {
            // thực hiện đoạn code khi có path 
            const imagePath = req.file.path
            const img = await jimp.read(imagePath);
            const baseImage = await img.getBase64Async(jimp.AUTO)
            const admin = new Admin({ email: email, passWord: password, name: name, role: role, image: baseImage });
            await admin.save();
            res.redirect('/admin/loginAdmin');
         } else {
            // thực hiện đoạn code khi không có path
            const admin = new Admin({ email: email, passWord: password, name: name, role: role, image: "" });
            await admin.save();
            res.redirect('/admin/loginAdmin');
         }

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
      const email = req.body.email;
      const pass = req.body.passWord;

      let user = await Admin.findOne({ email: email })
      if (!user) {
         const err = "Email không tồn tại !"
         // res.status(400).send(err)
         res.render("login", {
            error: err
         })
      } else {
         user.comparePassword(req.body.passWord, function (err, isMatch) {
            if (!err && isMatch) {
               // if user is found and password is right create a token
               let token = jwt.sign({ "email": email }, "secret", { expiresIn: '1h' });
               // console.log("generated token", token);
               res.cookie('token', token, { httpOnly: true });
               req.session.user = {
                  email: user.email,
                  passWord: user.passWord,
                  role: user.role,
                  image: user.image,
                  _id: user._id,
                  name: user.name,
                  pass: pass
               }
               res.redirect('/admin/home');

            } else {
               const err = "Mật khẩu không chính xác !"
               res.status(err).send(err);
               res.render("login", {
                  error: err
               });
            }
         });
      }
   } catch (err) {
      res.status(500).send(err.message)
   }
})

// API login user 


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

app.get("/home", verifyToken, (req, res) => {
   const user = req.session.user
   if (!user) {
      res.redirect("/admin/loginAdmin")
   } else {
      if (req.session.user.role === "admin") {
         res.redirect("/admin/getAllUsers")
      } else {
         res.redirect("/admin/getInformation")
      }
   }
})


/// users 
app.get("/getAllUsers", verifyToken, async (req, res) => {
   try {
      const users = await Admin.find({});
      // res.json(users);
      res.render("managerUser", {
         users: users.map(user => user.toJSON()),
      })
   } catch (error) {
      console.log(error)
   }
})

//API getAllUser mobile 
app.get("/getUsers", verifyToken, async (req, res) => {
   try {
      const users = await Admin.find({});
      res.json(users);
   } catch (error) {
      console.log(error)
   }
})

app.get("/delete/:id", verifyToken, async (req, res) => {
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

app.get("/edit/:id", verifyToken, async (req, res) => {
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
 
app.put("/inserUsers/:id", verifyToken, upload.single("image"), async (req, res) => {
   console.log(req.body)
   const { name, email, passWord } = req.body;
   const imagePath = req.file.path;
   const image = await jimp.read(imagePath);
   const base64Image = await image.getBase64Async(jimp.AUTO);

   Admin.updateOne({ _id: req.params.id }, { name, email, passWord, image: base64Image })
      .then(() => res.redirect("/admin/getAllUsers"))
      .catch(err => console.error(err))
})

app.get("/addUsers", verifyToken, (req, res) => {
   res.render("addUser", {
      titleView: "Inserter User",
   })
})
app.post("/inserUsers", verifyToken, upload.single("image"), async (req, res) => {
   try {
      const email = req.body.email;
      const password = req.body.passWord;
      const name = req.body.name;
      const role = req.body.role;
      if (req.file && req.file.path) {
         // thực hiện đoạn code khi có path
         const imagePath = req.file.path
         const img = await jimp.read(imagePath);
         const baseImage = await img.getBase64Async(jimp.AUTO)
         const admin = new Admin({ email: email, passWord: password, name: name, role: role, image: baseImage });
         await admin.save();
         res.redirect('/admin/getAllUsers');
      } else {
         // thực hiện đoạn code khi không có path
         const admin = new Admin({ email: email, passWord: password, name: name, role: role, image: "" });
         await admin.save();
         res.redirect('/admin/getAllUsers');
      }

   }
   catch (error) {
      res.status(500).send(error);
   }
})
app.get("/user", verifyToken, async (req, res) => {
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

app.get("/product", verifyToken, (req, res) => {
   res.redirect("/admin/getAllProducts")
})

//Product

async function getTypeProductByID(typeProductID) {
   try {
      const typeSP = await typeProduct.find({ _id: typeProductID });
      return typeSP;
   } catch (error) {
      console.log(error);
   }
}

app.get("/getAllProducts", verifyToken, async (req, res) => {
   try {
      const list = await product.find();
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
            soLuong: item.soLuong
         };
      }))

      res.render("managerProduct", {
         product: newList
      })
   } catch (error) {
      console.log(error);
   }
})

app.get("/addProduct", verifyToken, (req, res) => {
   res.render("addProduct", {
      titleView: "Inserter Products",
   })
})

app.post("/inserProduct", verifyToken, upload.single("image"), async (req, res) => {
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

app.get("/deleteProduct/:id", verifyToken, async (req, res) => {
   try {
      const ps = await product.findByIdAndDelete(req.params.id)
      if (!ps) {
         res.send("not found product")
      } else {
         res.redirect("/admin/getAllProducts")
      }
   } catch (error) {
      res.status(500).render(error)
   }

})

app.get("/editProduct/:id", verifyToken, async (req, res) => {

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

app.put("/updateProduct/:id", verifyToken, upload.single("image"), async (req, res) => {
   const { code_product, name_product, price, color, id_KH, name_KH, type_product } = req.body;
   if (req.file && req.file.path) {
      const imagePath = req.file.path;
      const image = await jimp.read(imagePath);
      const base64Image = await image.getBase64Async(jimp.AUTO);
      product.updateOne({ _id: req.params.id }, {
         code_product, name_product, price, color,
         id_KH, name_KH, type_product, image: base64Image
      })
         .then(() => res.redirect("/admin/getAllProducts"))
         .catch(err => console.error(err))
   }else{
      product.updateOne({ _id: req.params.id }, 
        req.body
      )
         .then(() => res.redirect("/admin/getAllProducts"))
         .catch(err => console.error(err))
   }

})


// search users 

app.get("/search", verifyToken, async (req, res) => {
   try {
      const name = req.query.search;
      const users = await Admin.find({ name: { $regex: name, $options: "i" } });

      res.render("managerUser", { users: users.map(user => user.toJSON()) });
   } catch (error) {
      res.status(500).send(error.message);
   }
});






// get Information user

app.get("/getInformation", verifyToken, async (req, res) => {
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

app.get("/editInformation/:id", verifyToken, async (req, res) => {
   try {
      const u = await Admin.findById(req.params.id)
      res.render("editInformation", {
         titleView: "Update Information",
         user: u.toJSON(),
      })
   } catch (error) {
      res.status(500).send(error);
   }

})

app.put("/updateInfor/:id", verifyToken, async (req, res) => {
   Admin.updateOne({ _id: req.params.id }, req.body)
      .then(() => {
         res.redirect("/admin/getAllInfor")
      })
      .catch(err => console.log(err))
})

app.get("/getAllInfor", verifyToken, async (req, res) => {
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