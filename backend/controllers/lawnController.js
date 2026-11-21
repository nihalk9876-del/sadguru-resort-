const db = require('../database/db');

exports.createLawnBooking = async (req, res) => {
  try {
    const { customerName, phone, email, date, eventType, guestCount, requirements, estimatedAmount, advancePaid } = req.body;

    if (!customerName || !phone || !date) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and event date are required.'
      });
    }

    const booking = await db.createLawnBooking({
      customerName,
      phone,
      email,
      date,
      eventType,
      guestCount,
      requirements,
      estimatedAmount,
      advancePaid
    });

    return res.status(201).json({
      success: true,
      message: 'Lush Green Lawn reservation confirmed successfully!',
      booking
    });
  } catch (err) {
    return res.status(409).json({ success: false, message: err.message });
  }
};

exports.getLawnBookings = (req, res) => {
  try {
    const filters = req.query;
    const bookings = db.getLawnBookings(filters);
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
