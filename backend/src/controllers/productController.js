const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category.toLowerCase() !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    
    const products = await Product.find(query);
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Public
exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    productData.owner = req.user.id;
    if (req.files && req.files.length > 0) {
      productData.photos = req.files.map(file => file.path);
    }
    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Public
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Public
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get cart
// @route   GET /api/v1/products/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.productId');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user.cart });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Add to cart
// @route   POST /api/v1/products/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const itemIndex = user.cart.findIndex(item => item.productId.toString() === productId);
    
    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += (quantity || 1);
    } else {
      user.cart.push({ productId, quantity: quantity || 1 });
    }

    await user.save();
    
    // Populate to return full info by re-querying
    const populatedUser = await User.findById(user._id).populate('cart.productId');
    
    res.status(200).json({ success: true, data: populatedUser.cart });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/v1/products/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const itemIndex = user.cart.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        user.cart.splice(itemIndex, 1);
      } else {
        user.cart[itemIndex].quantity = quantity;
      }
      await user.save();
    }
    
    const populatedUser = await User.findById(user._id).populate('cart.productId');
    res.status(200).json({ success: true, data: populatedUser.cart });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Remove from cart
// @route   DELETE /api/v1/products/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    await user.save();
    
    const populatedUser = await User.findById(user._id).populate('cart.productId');
    res.status(200).json({ success: true, data: populatedUser.cart });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Checkout cart
// @route   POST /api/v1/products/cart/checkout
// @access  Private
exports.checkout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    user.cart = [];
    await user.save();
    
    res.status(200).json({ success: true, message: 'Checkout successful', data: [] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get logged in user's products
// @route   GET /api/v1/products/my
// @access  Private
exports.getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ owner: req.user.id });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update a personal product
// @route   PATCH /api/v1/products/my/:id
// @access  Private
exports.updateMyProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    
    // Make sure user owns this product
    if (product.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const productData = { ...req.body };
    if (req.files && req.files.length > 0) {
      productData.photos = req.files.map(file => file.path);
    }

    product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a personal product
// @route   DELETE /api/v1/products/my/:id
// @access  Private
exports.deleteMyProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    if (product.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await product.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/v1/products/:id/reviews
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).populate('user', 'name avatar');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Add review to product
// @route   POST /api/v1/products/:id/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    req.body.product = req.params.id;
    req.body.user = req.user.id;

    // Check if product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const review = await Review.create(req.body);
    
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    // If user already submitted a review
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this product' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};
