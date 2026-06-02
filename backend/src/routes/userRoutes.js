const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  register,
  login,
  getMe,
  updateMe,
  updatePassword,
  getActivity
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
  .route('/me')
  .get(requireAuth, getMe)
  .patch(requireAuth, updateMe);

router.get('/me/activity', requireAuth, getActivity);
router.patch('/me/password', requireAuth, updatePassword);

router
  .route('/:id')
  .get(requireAuth, getUser)
  .put(requireAuth, updateUser)
  .delete(requireAuth, deleteUser);

module.exports = router;
