var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getProductById } = require("../helpers/product-helpers");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    // Give a temporary name, we’ll rename later
    cb(null, "temp_" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
const { getAllProducts } = require("../helpers/product-helpers");
const productHelpers = require("../helpers/product-helpers");
/* GET users listing. */
router.get("/", async function (req, res, next) {
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

  res.render("admin-dashboard", {
    products,
    layout: "admin-layout",
    title: "Admin Dashboard",
    isAdmin: true,
  });
});

router.post("/add-product", upload.single("productImage"), async (req, res) => {
  try {
    // Step 1: Add to DB
    const result = await productHelpers.addProduct(req.body, function (result) {
      if (result) console.log("a product has been addedd");
    }); // Assume this returns { insertedId }
    const productId = result.insertedId.toString();

    // Step 2: Rename uploaded image
    if (req.file) {
      const oldPath = req.file.path;
      const ext = path.extname(req.file.originalname); // preserve extension
      const newPath = path.join("public/uploads", `${productId}${ext}`);

      fs.rename(oldPath, newPath, (err) => {
        if (err) console.error("Image rename error:", err);
      });
    }

    res.redirect("/admin");
  } catch (error) {
    console.error("Add product failed:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/view-product", (req, res) => {
  res.render("admin-product-view", {
    admin: true,
    layout: "admin-layout",
    title: "Admin Dashboard",
  });
});

router.get("/product/:id", async (req, res) => {
  const productId = req.params.id;
  console.log("reached /product/:id", productId);
  try {
    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/edit-product",
  upload.single("editProductImage"),
  async (req, res) => {
    try {
      const {
        id, // product ID from hidden input
        editProductName,
        editProductCategory,
        editProductPrice,
        editProductStock,
        editProductDescription,
        editProductStatus,
      } = req.body;

      console.log("edit product", req.body);

      const updatedProduct = {
        productName: editProductName,
        productCategory: editProductCategory,
        productPrice: parseFloat(editProductPrice),
        stockQuantity: parseInt(editProductStock),
        description: editProductDescription,
        productStatus: editProductStatus === "on",
      };

      // Handle uploaded image
      if (req.file) {
        const uploadsDir = path.join(__dirname, "../public/uploads");

        // Remove existing image named after ID
        const existingFile = fs.readdirSync(uploadsDir).find((file) => {
          return path.parse(file).name === id;
        });

        if (existingFile) {
          fs.unlinkSync(path.join(uploadsDir, existingFile));
        }

        // Rename new uploaded file
        const ext = path.extname(req.file.originalname);
        const newFileName = `${id}${ext}`;
        const newFilePath = path.join(uploadsDir, newFileName);

        fs.renameSync(req.file.path, newFilePath);

        // Optional: save image path in DB
        updatedProduct.imagePath = `/uploads/${newFileName}`;
      }

      // Update product in DB
      await productHelpers.updateProduct(id, updatedProduct);

      res.json({ success: true });
    } catch (err) {
      console.error("Edit product error:", err);
      res.status(500).json({ error: "Failed to update product" });
    }
  }
);
router.delete("/delete-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    await productHelpers.deleteProduct(productId); // Write this helper function
    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
