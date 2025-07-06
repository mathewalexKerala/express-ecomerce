const { ObjectId } = require("mongodb");
const db = require("../config/connection");
const { compare } = require("../config/password-compare");
const bcrypt = require("bcrypt");

module.exports = {
  registerUser: (data) => {
    return new Promise(async (res, rej) => {
      try {
        const userExist = await db
          .get()
          .collection("USER")
          .findOne({ email: data.email });
        if (userExist) {
          throw new Error("User Exist");
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);

        data.password = hashedPassword;

        await db.get().collection("USER").insertOne(data);
      const getUser = await db.get().collection('USER').findOne({email:data.email})
        res(getUser);
      } catch (error) {
        rej(error);
      }
    });
  },
  loginUser: (data) => {
  return new Promise(async (res, rej) => {
    try {
      const userExist = await db
        .get()
        .collection("USER")
        .findOne({ email: data.email });

      if (!userExist) {
        return rej("User not found");
      }

      const match = await compare(data.password, userExist.password);

      if (match) {
        res(userExist); // ✅ only resolve if password matches
      } else {
        rej("Incorrect password"); // ✅ reject if password doesn't match
      }
    } catch (err) {
      rej(err);
    }
  });
},
isUserLoggedIn:function(req,res,next){
    if(req.session.user){
        next()
    }else{
        res.redirect('/login')
    }
},

isAuthenticated:(req,res,next)=>{
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
}

};
