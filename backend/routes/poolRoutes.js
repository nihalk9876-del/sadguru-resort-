const express = require('express');
const router = express.Router();
const poolController = require('../controllers/poolController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', poolController.createPoolBooking);
router.get('/', authMiddleware, poolController.getPoolBookings);

module.exports = router;
