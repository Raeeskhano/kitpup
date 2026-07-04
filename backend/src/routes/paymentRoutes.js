const express = require('express');
const router = express.Router();
const { createCheckoutSession, webhook } = require('../controllers/paymentController');
const { requireAuth } = require('../middlewares/auth');

// Create Stripe Checkout Session
router.post('/create-checkout-session', requireAuth, createCheckoutSession);

// Note: webhook is mounted in app.js

module.exports = router;
