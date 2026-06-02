const express = require('express');
const multer = require('multer');
const path = require('path');
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
  deleteMyPet
} = require('../controllers/petController');

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

module.exports = router;
