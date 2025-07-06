const { MongoClient } = require('mongodb');

const state = {
  db: null,
};

module.exports.connect = async function (cb) {
  try {
    const client = await MongoClient.connect('mongodb+srv://mathewalex557:123@cluster0.bceb2xi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
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
