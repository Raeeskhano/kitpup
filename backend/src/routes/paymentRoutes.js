const express = require('express');
const router = express.Router();
const { createCheckoutSession, webhook } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

// Create Stripe Checkout Session
router.post('/create-checkout-session', protect, createCheckoutSession);

// Note: webhook is mounted in app.js

module.exports = router;
