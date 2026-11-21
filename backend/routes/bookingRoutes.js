const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', bookingController.createBooking);
router.post('/track', bookingController.trackBooking);
router.get('/', authMiddleware, bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id/status', authMiddleware, bookingController.updateBookingStatus);
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
