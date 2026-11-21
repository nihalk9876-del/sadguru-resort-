const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', roomController.getAllRooms);
router.get('/check-availability', roomController.checkAvailability);
router.get('/:id', roomController.getRoomById);
router.put('/:id', authMiddleware, roomController.updateRoom);
router.post('/:id/toggle-maintenance', authMiddleware, roomController.toggleMaintenance);

module.exports = router;
