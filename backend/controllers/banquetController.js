const db = require('../database/db');

exports.createBanquetBooking = async (req, res) => {
  try {
    const { customerName, phone, email, date, timeSlot, eventType, guestCount, requirements, estimatedAmount, advancePaid } = req.body;

    if (!customerName || !phone || !date) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and event date are required.'
      });
    }

    const booking = await db.createBanquetBooking({
      customerName,
      phone,
      email,
      date,
      timeSlot,
      eventType,
      guestCount,
      requirements,
      estimatedAmount,
      advancePaid
    });

    return res.status(201).json({
      success: true,
      message: 'Banquet Hall reservation confirmed successfully!',
      booking
    });
  } catch (err) {
    return res.status(409).json({ success: false, message: err.message });
  }
};

exports.getBanquetBookings = (req, res) => {
  try {
    const filters = req.query;
    const bookings = db.getBanquetBookings(filters);
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
