const db = require('../database/db');
const { ROOM_STATUS } = require('../config/constants');

exports.getAllRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, category } = req.query;

    if (checkIn && checkOut) {
      let rooms = await db.getAvailableRooms(checkIn, checkOut, category, null);
      return res.json({ success: true, totalRooms: rooms.length, rooms });
    }

    let rooms = await db.getRooms();
    if (category) {
      rooms = rooms.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }

    return res.json({ success: true, totalRooms: rooms.length, rooms });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await db.getRoomById(id);
    if (!room) return res.status(404).json({ success: false, message: `Room ${id} not found.` });
    return res.json({ success: true, room });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut, category, guests } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'checkIn and checkOut dates are required.' });
    }
    const availableRooms = await db.getAvailableRooms(checkIn, checkOut, category, guests);
    return res.json({ success: true, checkIn, checkOut, availableCount: availableRooms.length, availableRooms });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await db.updateRoom(id, updates);
    return res.json({ success: true, message: 'Room updated successfully.', room: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.toggleMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await db.getRoomById(id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const newStatus = room.status === ROOM_STATUS.MAINTENANCE ? ROOM_STATUS.AVAILABLE : ROOM_STATUS.MAINTENANCE;
    const updated = await db.updateRoom(id, { status: newStatus });
    return res.json({ success: true, message: `Room status updated to ${newStatus}.`, room: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
