const Pet = require('../models/Pet');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Get all pets
// @route   GET /api/v1/pets
// @access  Public
exports.getPets = async (req, res, next) => {
  try {
    const { species, minFee, maxFee, search, breed, location, sort, status, limit, page } = req.query;

    let query = {};

    // We no longer exclude own pets so users can see their own listings in the marketplace
    /*
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
          // query.owner = { $ne: decoded.id };
        } catch (err) {
          // Token invalid or expired, ignore
        }
      }
    }
    */

    if (species && species !== 'All') query.species = species;
    if (status) query.status = status;
    if (breed && breed !== 'Any Breed') query.breed = breed;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) query.name = { $regex: search, $options: 'i' };
    
    if (minFee || maxFee) {
      query.fee = {};
      if (minFee) query.fee.$gte = Number(minFee);
      if (maxFee) query.fee.$lte = Number(maxFee);
    }

    let mongooseQuery = Pet.find(query);

    if (sort === 'Newest Match' || sort === 'newest') {
      mongooseQuery = mongooseQuery.sort('-createdAt');
    } else if (sort === 'Lowest Fee') {
      mongooseQuery = mongooseQuery.sort('fee');
    } else {
      mongooseQuery = mongooseQuery.sort('-createdAt');
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    
    mongooseQuery = mongooseQuery.skip(startIndex).limit(limitNum).populate('owner', 'name contactNumber whatsappNumber');

    const pets = await mongooseQuery;

    res.status(200).json({ success: true, count: pets.length, page: pageNum, data: pets });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single pet
// @route   GET /api/v1/pets/:id
// @access  Public
exports.getPet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('owner', 'name contactNumber whatsappNumber');
    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }
    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create new pet
// @route   POST /api/v1/pets
// @access  Private
exports.createPet = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;

    if (req.files && req.files.length > 0) {
      req.body.photos = req.files.map(file => `/uploads/${file.filename}`);
    } else {
      req.body.photos = ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400&h=500'];
    }

    if (req.body.fee) req.body.fee = Number(req.body.fee);

    const pet = await Pet.create(req.body);
    res.status(201).json({ success: true, data: pet });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update pet
// @route   PUT /api/v1/pets/:id
// @access  Private
exports.updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }
    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete pet
// @route   DELETE /api/v1/pets/:id
// @access  Private
exports.deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Toggle favorite
// @route   PATCH /api/v1/pets/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const petId = req.params.id;
    const isFavorite = user.favorites.includes(petId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== petId.toString());
    } else {
      user.favorites.push(petId);
    }

    await user.save();
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Notify Nearby Users
// @route   POST /api/v1/pets/:id/notify
// @access  Private
exports.notifyNearby = async (req, res, next) => {
  try {
    // In a real application, this would calculate proximity to users 
    // and send push notifications or emails.
    // For now, we mock success.
    res.status(200).json({ success: true, message: 'Nearby users have been notified!' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get logged in user's personal pets
// @route   GET /api/v1/pets/my
// @access  Private
exports.getMyPets = async (req, res, next) => {
  try {
    const pets = await Pet.find({ owner: req.user.id });
    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create a personal pet
// @route   POST /api/v1/pets/my
// @access  Private
exports.createMyPet = async (req, res, next) => {
  try {
    // Force owner
    req.body.owner = req.user.id;
    if (!req.body.status) {
      req.body.status = 'personal';
    }
    
    if (req.body.fee) {
      req.body.fee = Number(req.body.fee);
    } else {
      req.body.fee = 0;
    }

    // Handle uploaded photos
    if (req.files && req.files.length > 0) {
      req.body.photos = req.files.map(f => `http://localhost:5000/uploads/${f.filename}`);
    }

    const pet = await Pet.create(req.body);
    res.status(201).json({ success: true, data: pet });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update a personal pet
// @route   PATCH /api/v1/pets/my/:id
// @access  Private
exports.updateMyPet = async (req, res, next) => {
  try {
    let pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, error: 'Pet not found' });
    
    // Make sure user owns this pet
    if (pet.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    if (req.body.fee) {
      req.body.fee = Number(req.body.fee);
    }

    if (req.files && req.files.length > 0) {
      req.body.photos = req.files.map(f => `http://localhost:5000/uploads/${f.filename}`);
    }

    pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a personal pet
// @route   DELETE /api/v1/pets/my/:id
// @access  Private
exports.deleteMyPet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, error: 'Pet not found' });

    if (pet.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await pet.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
