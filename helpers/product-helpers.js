const { ObjectId } = require("mongodb");
const db = require("../config/connection");

module.exports = {
  addProduct: async (product, cb) => {

    let result = await db.get().collection("products").insertOne(product);
    cb(true);
    return result;
  },
  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("products")
        .find()
        .toArray()
        .then((products) => {
          resolve(products);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  getProductById: async (id) => {
    const objectId = new ObjectId(id); // ✅ use `new`
    return await db.get().collection("products").findOne({ _id: objectId });
  },
  deleteProduct: async (id) => {
    return await db
      .get()
      .collection("products")
      .deleteOne({ _id: new ObjectId(id) })
      .then((data) => {
        console.log("deleted", id);
      });
  },
  updateProduct: async (id, updatedData) => {
    const dbInstance = db.get();
    await dbInstance
      .collection("products")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedData })
      .then((data) => console.log("product updated ", data));
  },
  addToCart: async (product, req) => {
   try {
     const dbInstance = db.get();
    const users = dbInstance.collection("USER");
    const userEmail = req.session.user?.email;
    const user = await users.findOne({ email: userEmail });
   
    if (!user.cart) {
  user.cart = [];
}

    const existingIndex = user.cart?.findIndex(
      (item) => item.productId === product.productId
    );
    console.log('existing index',existingIndex)
    if (existingIndex !== -1) {
      await users.updateOne(
        { email: userEmail, "cart.productId": product.productId },
        { $inc: { "cart.$.quantity": 1 } }
      );
    } else {
      const newItem = {
  productId: product.productId,
  productName: product.productName,
  productPrice: parseFloat(product.productPrice),  // ✅ FIXED
  productImage: product.productImage,
  quantity: 1,
};

      await users.updateOne({ email: userEmail }, { $push: { cart: newItem } }).then((data)=>{
        console.log('updated',data)
      })
   } 
    }catch(error){
      console.error("Error in addToCart:", err.message);
    }
  },
  getCart: async (userId,req) => {
    const dbInstance = db.get();
    const users = dbInstance.collection("users");
    const email = req.session.user?.email;

    if (!email) {
      return res.redirect("/login");
    }

    const user = await users.findOne({ email });

    res.render("user-cart", {
      cartItems: user.cart || [],
    });
  },
};
