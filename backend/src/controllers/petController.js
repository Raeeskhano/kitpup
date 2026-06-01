const Pet = require('../models/Pet');
const User = require('../models/User');

// @desc    Get all pets
// @route   GET /api/v1/pets
// @access  Public
exports.getPets = async (req, res, next) => {
  try {
    const { species, minFee, maxFee, search, breed, location, sort, status, limit } = req.query;

    let query = {};

    if (species) query.species = species;
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

    if (limit) {
      mongooseQuery = mongooseQuery.limit(Number(limit));
    }

    const pets = await mongooseQuery;

    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single pet
// @route   GET /api/v1/pets/:id
// @access  Public
exports.getPet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
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
