const User = require('../models/User');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff`
    }
  });
};

// @desc    Register user
// @route   POST /api/v1/users/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/users/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Public
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Public
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create new user
// @route   POST /api/v1/users
// @access  Public
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Public
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Public
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update user details
// @route   PATCH /api/v1/users/me
// @access  Private
exports.updateMe = async (req, res, next) => {
  try {
    const { email, name, preferences, notifications } = req.body;
    
    // Build update object securely
    const updateFields = {};
    if (email) updateFields.email = email;
    if (name) updateFields.name = name;
    if (preferences) updateFields.preferences = preferences;
    if (notifications) updateFields.notifications = notifications;

    if (req.file) {
      // In a real app we'd upload to Cloudinary/S3, here we just save the local path
      updateFields.avatar = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update password
// @route   PATCH /api/v1/users/me/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, error: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook handles hashing

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get user recent activity (Mocked for now)
// @route   GET /api/v1/users/me/activity
// @access  Private
exports.getActivity = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    
    // Mocked Activity History
    const mockActivities = [
      { _id: '1', type: 'purchase', title: 'Bought "Premium Pet Food"', source: 'Marketplace', date: new Date(Date.now() - 86400000 * 1) },
      { _id: '2', type: 'report', title: 'Reported a Lost Cat', source: 'Rescue Reporting', date: new Date(Date.now() - 86400000 * 3) },
      { _id: '3', type: 'appointment', title: 'City Paws Clinic', source: 'Vet Appointment', date: new Date(Date.now() - 86400000 * 5) },
      { _id: '4', type: 'purchase', title: 'Bought "Chew Toy"', source: 'Marketplace', date: new Date(Date.now() - 86400000 * 10) },
    ];

    res.status(200).json({ success: true, count: limit, data: mockActivities.slice(0, limit) });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
