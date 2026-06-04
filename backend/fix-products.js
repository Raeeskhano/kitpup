const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/kitpup').then(async () => {
  const user = await User.findOne({ name: 'Test' });
  if (!user) {
    console.log("Test user not found");
    process.exit(1);
  }
  
  const products = await Product.find({ owner: { $exists: false } });
  for (let p of products) {
    p.owner = user._id;
    await p.save();
    console.log(`Updated ${p.name} with owner ${user._id}`);
  }
  
  const productsNull = await Product.find({ owner: null });
  for (let p of productsNull) {
    p.owner = user._id;
    await p.save();
    console.log(`Updated ${p.name} with owner ${user._id}`);
  }

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
