const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);
router.put('/:id', authMiddleware, packageController.updatePackage);
router.post('/book', packageController.bookPackage);
router.get('/bookings/all', authMiddleware, packageController.getPackageBookings);

module.exports = router;
