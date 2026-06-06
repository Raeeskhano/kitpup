const express = require('express');
const { upload } = require('../config/cloudinary');
const {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport
} = require('../controllers/reportController');

const { requireAuth } = require('../middlewares/auth');

const router = express.Router();



router
  .route('/')
  .get(requireAuth, getReports)
  .post(requireAuth, upload.array('photos', 5), createReport);

router
  .route('/:id')
  .get(requireAuth, getReport)
  .put(requireAuth, updateReport)
  .delete(requireAuth, deleteReport);

module.exports = router;
