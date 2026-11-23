const db = require('../database/db');

exports.createPoolBooking = async (req, res) => {
  try {
    const { customerName, phone, email, date, timeSlot, adultCount, childCount, paymentMethod, notes } = req.body;

    if (!customerName || !phone || !date) {
      return res.status(400).json({ success: false, message: 'Name, phone number, and visit date are required.' });
    }

    const booking = await db.createPoolBooking({ customerName, phone, email, date, timeSlot, adultCount, childCount, paymentMethod, notes });
    return res.status(201).json({ success: true, message: 'Swimming pool slot reserved successfully!', booking });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.getPoolBookings = async (req, res) => {
  try {
    const filters = req.query;
    const bookings = await db.getPoolBookings(filters);
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
