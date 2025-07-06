const bcrypt = require("bcrypt");
module.exports = {
  compare: (enteredPassword, dbPassword) => {
    return new Promise(async (res, rej) => {
      try {
        const match = await bcrypt.compare(enteredPassword, dbPassword);
        res(match);
      } catch (error) {
        rej(error);
      }
    });
  },
};
