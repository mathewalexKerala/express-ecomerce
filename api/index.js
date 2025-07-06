const app = require('../app'); // adjust path if needed

module.exports = (req, res) => {
  app(req, res); // Vercel will invoke Express as a handler
};
