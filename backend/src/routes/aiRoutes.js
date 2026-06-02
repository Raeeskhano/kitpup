const express = require('express');
const { chatWithAI } = require('../controllers/aiController');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.post('/chat', requireAuth, chatWithAI);

module.exports = router;
