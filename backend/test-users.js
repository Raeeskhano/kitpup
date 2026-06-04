const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/kitpup').then(async () => {
  const users = await User.find({});
  console.log("Users:");
  users.forEach(u => {
    console.log(`User: ${u.name}, ID: ${u._id}`);
  });
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
