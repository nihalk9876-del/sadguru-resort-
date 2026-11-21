const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', contactController.submitInquiry);
router.get('/inquiries', authMiddleware, contactController.getInquiries);
router.get('/reviews', contactController.getReviews);

module.exports = router;
