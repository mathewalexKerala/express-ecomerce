const { MongoClient } = require('mongodb');

const state = {
  db: null,
};

module.exports.connect = async function (cb) {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    state.db = client.db('shopping');
    console.log('Connected to MongoDB');
    cb(); // success callback
  } catch (err) {
    cb(err); // error callback
  }
};

module.exports.get = function () {
  return state.db;
};
