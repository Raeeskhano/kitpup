const express = require('express');
const cors = require('cors');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve uploads
app.use('/uploads', express.static('uploads'));

// Route files
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Mount routers
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/pets', petRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/reports', reportRoutes);

module.exports = app;
