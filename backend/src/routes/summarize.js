const express = require('express');
const router = express.Router();
const summarizeController = require('../controllers/summarizeController');

router.post('/', summarizeController.generateSummaries);

module.exports = router; 