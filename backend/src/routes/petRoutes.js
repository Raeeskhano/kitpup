const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getPets,
  getPet,
  createPet,
  updatePet,
  deletePet,
  toggleFavorite
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
  .get(requireAuth, getPets)
  .post(requireAuth, upload.array('photos', 5), createPet);

router
  .route('/:id')
  .get(requireAuth, getPet)
  .put(requireAuth, updatePet)
  .delete(requireAuth, deletePet);

router
  .route('/:id/favorite')
  .patch(requireAuth, toggleFavorite);

module.exports = router;
