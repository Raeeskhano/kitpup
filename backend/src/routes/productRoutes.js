const express = require('express');
const multer = require('multer');
const path = require('path');
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
  checkout,
  getMyProducts,
  updateMyProduct,
  deleteMyProduct
} = require('../controllers/productController');

const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

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
  .route('/my')
  .get(requireAuth, getMyProducts);

router
  .route('/my/:id')
  .patch(requireAuth, upload.array('photos', 5), updateMyProduct)
  .delete(requireAuth, deleteMyProduct);

router
  .route('/')
  .get(getProducts)
  .post(requireAuth, upload.array('photos', 5), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(requireAuth, updateProduct)
  .delete(requireAuth, deleteProduct);

module.exports = router;
