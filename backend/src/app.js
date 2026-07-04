const express = require('express');
const cors = require('cors');

const app = express();

// Webhook route needs raw body parser, so it must be before express.json()
const { webhook } = require('./controllers/paymentController');
app.post('/api/v1/payments/webhook', express.raw({type: 'application/json'}), webhook);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Serve uploads
app.use('/uploads', express.static('uploads'));

// Route files
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Mount routers
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/pets', petRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/payments', paymentRoutes);

module.exports = app;
