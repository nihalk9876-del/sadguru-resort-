const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Existing admin settings & stats
router.get('/stats', authMiddleware, adminController.getStats);
router.get('/settings', adminController.getSettings);
router.put('/settings', authMiddleware, adminController.updateSettings);

// Dedicated Admin App endpoints
router.get('/room-matrix', adminController.getRoomMatrix);
router.post('/on-spot-booking', adminController.createOnSpotBooking);
router.post('/checkout-room', adminController.checkoutRoom);
router.post('/checkout-room/:roomNumber', adminController.checkoutRoom);
router.post('/early-checkout', adminController.earlyCheckout);
router.post('/complete-cleaning', adminController.completeCleaning);
router.post('/room-status', adminController.updateRoomStatus);
router.post('/add-payment', adminController.addPayment);
router.post('/pool-pass', adminController.createPoolPass);
router.get('/reports', adminController.getReports);

// Push Notification & FCM token management
router.post('/device-token', adminController.registerDeviceToken);
router.delete('/device-token', adminController.unregisterDeviceToken);
router.get('/notification-logs', adminController.getNotificationLogs);

// CNN + Server OCR
router.post('/analyze-aadhaar', adminController.analyzeAadhaarImage);
router.get('/ocr-status', adminController.getOcrModelStatus);

module.exports = router;
