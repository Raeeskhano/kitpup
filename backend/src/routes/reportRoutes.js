const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport
} = require('../controllers/reportController');

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
  .get(requireAuth, getReports)
  .post(requireAuth, upload.array('photos', 5), createReport);

router
  .route('/:id')
  .get(requireAuth, getReport)
  .put(requireAuth, updateReport)
  .delete(requireAuth, deleteReport);

module.exports = router;
