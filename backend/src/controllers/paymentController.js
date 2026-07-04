// Initialize stripe with the key, or a fallback to prevent the entire server from crashing if the env var is missing
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'missing_stripe_key_in_env');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Create Stripe Checkout Session
// @route   POST /api/v1/payments/create-checkout-session
// @access  Private
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.productId');
    
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    const lineItems = user.cart.map(item => {
      return {
        price_data: {
          currency: 'pkr',
          product_data: {
            name: item.productId.name,
            images: item.productId.photos && item.productId.photos.length > 0 ? [item.productId.photos[0]] : [],
          },
          unit_amount: Math.round(item.productId.price * 100), // Stripe expects amounts in cents/paisa
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/cancel`,
      client_reference_id: req.user.id,
      metadata: {
        userId: req.user.id,
      }
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Stripe Webhook
// @route   POST /api/v1/payments/webhook
// @access  Public
exports.webhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id || session.metadata.userId;

    if (userId) {
      try {
        const user = await User.findById(userId).populate('cart.productId');
        if (user && user.cart.length > 0) {
          const totalAmount = user.cart.reduce((acc, item) => acc + (item.productId.price * item.quantity), 0);
          
          const orderItems = user.cart.map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            quantity: item.quantity,
            price: item.productId.price
          }));

          await Order.create({
            user: userId,
            items: orderItems,
            totalAmount: totalAmount,
            currency: 'pkr',
            transactionId: session.id, // Using generic transactionId we kept
            paymentGateway: 'stripe',
            paymentStatus: 'paid'
          });

          user.cart = [];
          await user.save();
        }
      } catch (err) {
        console.error('Error processing successful checkout:', err);
      }
    }
  }

  res.send();
};
