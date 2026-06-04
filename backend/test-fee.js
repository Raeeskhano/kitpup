const mongoose = require('mongoose');
const Pet = require('./src/models/Pet');

mongoose.connect('mongodb://127.0.0.1:27017/kitpup').then(async () => {
  const pets = await Pet.find({});
  pets.forEach(p => {
    console.log(`Pet: ${p.name}, Fee: ${p.fee}`);
  });
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
