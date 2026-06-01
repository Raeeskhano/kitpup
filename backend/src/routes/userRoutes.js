const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  register,
  login
} = require('../controllers/userController');

const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router
  .route('/')
  .get(requireAuth, getUsers)
  .post(requireAuth, createUser);

router
  .route('/:id')
  .get(requireAuth, getUser)
  .put(requireAuth, updateUser)
  .delete(requireAuth, deleteUser);

module.exports = router;
