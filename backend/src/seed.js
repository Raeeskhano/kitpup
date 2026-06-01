const mongoose = require('mongoose');
const User = require('./models/User');
const Pet = require('./models/Pet');
const Product = require('./models/Product');
const Report = require('./models/Report');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kitpup';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Pet.deleteMany({});
    await Product.deleteMany({});
    await Report.deleteMany({});

    console.log('Seeding Users...');
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
      contactNumber: '1234567890',
      address: '123 Main St, City, Country'
    });
    
    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'admin',
      contactNumber: '0987654321',
      address: '456 Oak Ave, City, Country'
    });
    
    const users = [user1, user2];

    console.log('Seeding Pets...');
    await Pet.insertMany([
      {
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: '2 yrs',
        gender: 'Male',
        location: 'New York, NY',
        status: 'active',
        description: 'Friendly and playful.',
        fee: 500,
        owner: users[0]._id,
        photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400&h=500']
      },
      {
        name: 'Luna',
        species: 'Cat',
        breed: 'Siamese Cat',
        age: '1 yr',
        gender: 'Female',
        location: 'Brooklyn, NY',
        status: 'active',
        description: 'Very affectionate.',
        fee: 300,
        owner: users[1]._id,
        photos: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400&h=500']
      }
    ]);

    console.log('Seeding Products...');
    await Product.insertMany([
      {
        name: 'Premium Salmon Dog Food',
        description: 'High quality dry food for adult dogs.',
        price: 45.99,
        originalPrice: 55.99,
        category: 'Food & Treats',
        stock: 100,
        rating: 4.8,
        reviewCount: 128,
        badge: 'Sale',
        photos: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=400&h=400']
      },
      {
        name: 'Plush Squeaky Bone',
        description: 'Durable squeaky toy for all dog sizes.',
        price: 12.99,
        category: 'Toys',
        stock: 50,
        rating: 4.5,
        reviewCount: 84,
        badge: 'Best Seller',
        photos: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400&h=400']
      },
      {
        name: 'Cozy Orthopedic Bed',
        description: 'Memory foam bed for large breeds.',
        price: 89.99,
        category: 'Beds & Crates',
        stock: 0,
        rating: 4.9,
        reviewCount: 210,
        badge: '',
        photos: ['https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=400&h=400']
      },
      {
        name: 'Knit Dog Sweater',
        description: 'Warm winter sweater for small dogs.',
        price: 24.99,
        category: 'Apparel',
        stock: 15,
        rating: 4.2,
        reviewCount: 45,
        badge: '',
        photos: ['https://images.unsplash.com/photo-1521199343063-e31b53c13e51?auto=format&fit=crop&q=80&w=400&h=400']
      }
    ]);

    console.log('Seeding Reports...');
    await Report.insertMany([
      {
        type: 'lost',
        petType: 'Dog',
        description: 'Lost my brown poodle near Central Park.',
        location: 'Central Park',
        reporter: users[0]._id,
        status: 'open',
        imageUrl: 'https://example.com/lost_poodle.jpg'
      },
      {
        type: 'rescue',
        petType: 'Cat',
        description: 'Found a stray kitten that needs a home.',
        location: 'Downtown',
        reporter: users[1]._id,
        status: 'open',
        imageUrl: 'https://example.com/rescue_kitten.jpg'
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
