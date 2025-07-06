var express = require("express");
var router = express.Router();
const path = require("path");
const fs = require("fs");
const app = express();
const session = require("express-session");
const {
  getAllProducts,
  addToCart,
  getCart,
} = require("../helpers/product-helpers");
const { loginUser } = require("../helpers/user-helpers");
const { isAuthenticated } = require("../helpers/user-helpers");
/* GET home page. */
const { registerUser } = require("../helpers/user-helpers");
const db = require('../config/connection')

app.use(
  session({
    secret: "secretKey",
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: false,
    },
  })
);
router.get("/",async function (req, res, next) {


  const uploadsDir = path.join(__dirname, "../public/uploads");
  let products = await getAllProducts();
  products = products.map((product, index) => {
    const productIdStr = product._id.toString();

    let imageFile = fs.readdirSync(uploadsDir).find((file) => {
      return path.parse(file).name === productIdStr;
    });

    const imageUrl = imageFile
      ? `/uploads/${imageFile}`
      : "/images/default.png";

    return {
      ...product,
      displayIndex: index + 1,
      productImage: imageUrl,
    };
  });
 const cart = req.session.user?.cart || []
 console.log('cart',cart.length)

  if(req.session.user){
  res.render("index", {
    title: "Ecommerce",
    products,
    admin: false,
    user: req.session.user,
    cart:cart.length || 0
  });
}else{
   res.render("index", {
    title: "Ecommerce",
    products,
  
    cart: 0
  }); 
}

});

router.get("/login", (req, res) => {
  res.render("user-login", { title: "Ecommerce" });
});
router.post("/login", async (req, res) => {
  const uploadsDir = path.join(__dirname, "../public/uploads");

  try {
    const user = await loginUser(req.body); // ✅ awaits and receives user only if password matches

    req.session.user = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      isAgree: user.isAgree,
      cart:user.cart
    };

    let products = await getAllProducts();
    products = products.map((product, index) => {
      const productIdStr = product._id.toString();

      let imageFile = fs.readdirSync(uploadsDir).find((file) => {
        return path.parse(file).name === productIdStr;
      });

      const imageUrl = imageFile
        ? `/uploads/${imageFile}`
        : "/images/default.png";

      return {
        ...product,
        displayIndex: index + 1,
        productImage: imageUrl,
      };
    });

    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    res.render("user-login", { error: "Invalid email or password" }); // Show error message
  }
});

router.get("/signup", (req, res) => {
  res.render("user-signup");
});

router.post("/signup", async (req, res) => {
  await registerUser(req.body)
    .then(async function (user) {
      const uploadsDir = path.join(__dirname, "../public/uploads");
      let products = await getAllProducts();
      products = products.map((product, index) => {
        const productIdStr = product._id.toString();

        let imageFile = fs.readdirSync(uploadsDir).find((file) => {
          return path.parse(file).name === productIdStr;
        });

        const imageUrl = imageFile
          ? `/uploads/${imageFile}`
          : "/images/default.png";

        return {
          ...product,
          displayIndex: index + 1,
          productImage: imageUrl,
        };
      });
      console.log(user, "user is this", user._id.toString());
      req.session.user = {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        isAgree: user.isAgree,cart:user.cart
      };
      console.log("req.session.user", req.session.user);
      res.redirect("/");
    })
    .catch((error) => {
      console.log("error creating the user", error.message);

      res.render("user-signup");
    });
});
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Session destruction error:", err);
      return res.redirect("/");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});
router.get("/cart", isAuthenticated, async (req, res) => {
  const uploadsDir = path.join(__dirname, "../public/uploads");
  let products = await getAllProducts();
  products = products.map((product, index) => {
    const productIdStr = product._id.toString();

    let imageFile = fs.readdirSync(uploadsDir).find((file) => {
      return path.parse(file).name === productIdStr;
    });

    const imageUrl = imageFile
      ? `/uploads/${imageFile}`
      : "/images/default.png";

    return {
      ...product,
      displayIndex: index + 1,
      productImage: imageUrl,
    };
  });
  const user = req.session.user
 res.render('user-cart',{title: "Ecommerce",
    products,
    admin: false,
    user,
    cart:user.cart.length || 0
  }
); })

router.post("/add-to-cart", isAuthenticated, async (req, res) => {
  console.log("add to cart", req.body);
  const { productId, productName, productPrice, productImage } = req.body;
  await addToCart({ productId, productName, productPrice, productImage }, req);
  res.redirect("/");
});

module.exports = router;
