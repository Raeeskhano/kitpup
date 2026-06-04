const mongoose = require('mongoose');
const Pet = require('./src/models/Pet');
const User = require('./src/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/kitpup').then(async () => {
  const pets = await Pet.find({}).populate('owner', 'name');
  console.log(`Total pets: ${pets.length}`);
  pets.forEach(p => {
    console.log(`Pet: ${p.name}, Species: ${p.species}, Status: ${p.status}, Owner: ${p.owner?.name}, Date: ${p.createdAt}`);
  });
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
