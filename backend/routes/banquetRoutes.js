const express = require('express');
const router = express.Router();
const banquetController = require('../controllers/banquetController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', banquetController.createBanquetBooking);
router.get('/', authMiddleware, banquetController.getBanquetBookings);

module.exports = router;
