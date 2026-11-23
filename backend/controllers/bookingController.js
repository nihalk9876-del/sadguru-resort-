const db = require('../database/db');
const { broadcastEvent } = require('../socket');

exports.createBooking = async (req, res) => {
  try {
    const { roomId, roomNumber, category, customerName, phone, email, address, checkIn, checkOut, guests, adults, children, advancePaid, paymentMethod, specialRequests } = req.body;

    if (!customerName || !phone || !email || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Name, phone, email, check-in, and check-out dates are required.' });
    }

    const booking = await db.createRoomBooking({
      roomId, roomNumber, category,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      address, checkIn, checkOut,
      guests: guests || 2,
      adults: adults || guests || 2,
      children: children || 0,
      advancePaid, paymentMethod, specialRequests
    });

    broadcastEvent('booking_created', booking);
    const matrix = await db.getRoomMatrix();
    broadcastEvent('matrix_updated', matrix);

    return res.status(201).json({ success: true, message: 'Reservation created and confirmed successfully!', booking });
  } catch (err) {
    console.error('Booking creation error:', err.message);
    return res.status(409).json({ success: false, message: err.message || 'Unable to book room for selected dates.' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const filters = req.query;
    const bookings = await db.getBookings(filters);
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await db.getBookingById(id);
    if (!booking) return res.status(404).json({ success: false, message: `Booking ${id} not found.` });
    return res.json({ success: true, booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.trackBooking = async (req, res) => {
  try {
    const { bookingId, phone } = req.body;
    if (!bookingId || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide both Booking Reference ID and phone number.' });
    }
    const booking = await db.getBookingByIdAndPhone(bookingId, phone);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'No active reservation found with these credentials.' });
    }
    return res.json({ success: true, booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    const updated = await db.updateBookingStatus(id, status, paymentStatus);
    broadcastEvent('booking_updated', updated);
    const matrix = await db.getRoomMatrix();
    broadcastEvent('matrix_updated', matrix);
    return res.json({ success: true, message: `Booking ${id} updated successfully.`, booking: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const cancelled = await db.cancelBooking(id, reason);
    broadcastEvent('booking_cancelled', cancelled);
    const matrix = await db.getRoomMatrix();
    broadcastEvent('matrix_updated', matrix);
    return res.json({ success: true, message: `Booking ${id} has been cancelled.`, booking: cancelled });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
