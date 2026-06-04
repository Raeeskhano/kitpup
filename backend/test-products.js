const mongoose = require('mongoose');
const Product = require('./src/models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/kitpup').then(async () => {
  const products = await Product.find({});
  console.log("Total Products:", products.length);
  products.forEach(p => {
    console.log(`Product: ${p.name}, Owner: ${p.owner}`);
  });
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
