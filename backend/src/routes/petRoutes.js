const express = require('express');
const { upload } = require('../config/cloudinary');
const {
  getPets,
  getPet,
  createPet,
  updatePet,
  deletePet,
  toggleFavorite,
  notifyNearby,
  getMyPets,
  createMyPet,
  updateMyPet,
  deleteMyPet,
  contactOwner
} = require('../controllers/petController');

const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(getPets) // Removed requireAuth for GET to allow public viewing
  .post(requireAuth, upload.array('photos', 5), createPet);

router
  .route('/my')
  .get(requireAuth, getMyPets)
  .post(requireAuth, upload.array('photos', 5), createMyPet);

router
  .route('/my/:id')
  .patch(requireAuth, upload.array('photos', 5), updateMyPet)
  .delete(requireAuth, deleteMyPet);

router
  .route('/:id')
  .get(getPet) // Removed requireAuth
  .put(requireAuth, updatePet)
  .patch(requireAuth, updatePet)
  .delete(requireAuth, deletePet);

router
  .route('/:id/favorite')
  .patch(requireAuth, toggleFavorite);

router
  .route('/:id/notify')
  .post(requireAuth, notifyNearby);

router
  .route('/:id/contact')
  .post(requireAuth, contactOwner);

module.exports = router;
