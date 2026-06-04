const mongoose = require('mongoose');
const Pet = require('./src/models/Pet');

mongoose.connect('mongodb://127.0.0.1:27017/kitpup').then(async () => {
  await Pet.updateMany({ fee: { $exists: false } }, { $set: { fee: 0 } });
  await Pet.updateMany({ fee: null }, { $set: { fee: 0 } });
  console.log("Updated pets with missing fees to 0.");
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
