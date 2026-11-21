const express = require('express');
const router = express.Router();
const lawnController = require('../controllers/lawnController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', lawnController.createLawnBooking);
router.get('/', authMiddleware, lawnController.getLawnBookings);

module.exports = router;
