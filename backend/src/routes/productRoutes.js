const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  checkout
} = require('../controllers/productController');

const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

// Specific routes first to avoid conflicts with /:id
router.post('/cart/checkout', requireAuth, checkout);

router
  .route('/cart/:productId')
  .put(requireAuth, updateCartItem)
  .delete(requireAuth, removeFromCart);

router
  .route('/cart')
  .get(requireAuth, getCart)
  .post(requireAuth, addToCart);

router
  .route('/')
  .get(getProducts)
  .post(requireAuth, createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(requireAuth, updateProduct)
  .delete(requireAuth, deleteProduct);

module.exports = router;
