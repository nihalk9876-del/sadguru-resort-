const db = require('../database/db');
const { broadcastEvent } = require('../socket');
const notificationService = require('../services/notificationService');

exports.getStats = async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    return res.json({ success: true, stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await db.getSettings();
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    const settings = await db.updateSettings(updates);
    broadcastEvent('settings_updated', settings);
    return res.json({ success: true, message: 'Settings updated successfully.', settings });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Live Floor Plan / Room Matrix (All 9 rooms live occupancy)
exports.getRoomMatrix = async (req, res) => {
  try {
    const matrix = await db.getRoomMatrix();
    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      rooms: matrix
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// On-Spot Room Booking with Aadhaar & Custom Rate
exports.createOnSpotBooking = async (req, res) => {
  try {
    const booking = await db.createOnSpotRoomBooking(req.body);
    broadcastEvent('booking_created', booking);
    const matrix = await db.getRoomMatrix();
    broadcastEvent('matrix_updated', matrix);

    // Trigger Push Notification to Owner & Admin mobile devices after DB confirmation
    notificationService.sendBookingNotification({
      booking,
      roomNumbers: [booking.roomNumber]
    }).catch(notifErr => console.warn('[FCM Booking Push Alert Error]:', notifErr.message));

    return res.status(201).json({
      success: true,
      message: `Room ${booking.roomNumber} successfully allotted and checked-in!`,
      booking
    });
  } catch (err) {
    console.error('On-spot booking failed:', err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Standard Checkout
exports.checkoutRoom = async (req, res) => {
  try {
    const roomNumber = req.body.roomNumber || req.params.roomNumber;
    if (!roomNumber) return res.status(400).json({ success: false, message: 'Room number is required.' });

    const result = await db.earlyCheckoutRoomBooking(roomNumber, req.body.actualCheckOutTime);
    broadcastEvent('room_checked_out', { roomNumber, booking: result.booking });
    const matrix = await db.getRoomMatrix();
    broadcastEvent('matrix_updated', matrix);

    // Trigger Push Notification to Owner & Admin mobile devices after DB confirmation
    notificationService.sendCheckoutNotification({
      booking: result.booking,
      roomNumber,
      isEarly: false
    }).catch(notifErr => console.warn('[FCM Checkout Push Alert Error]:', notifErr.message));

    return res.json({
      success: true,
      message: `Room ${roomNumber} checked out and moved to Cleaning status.`,
      booking: result.booking
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Early Check-out
exports.earlyCheckout = async (req, res) => {
  try {
    const { roomNumber, bookingId, actualCheckOutTime } = req.body;
    const target = roomNumber || bookingId;
    if (!target) return res.status(400).json({ success: false, message: 'Room number or Booking ID is required.' });

    const result = await db.earlyCheckoutRoomBooking(target, actualCheckOutTime);
    broadcastEvent('early_checkout', { roomNumber: result.booking.roomNumber, booking: result.booking });
    const matrix = await db.getRoomMatrix();
    broadcastEvent('matrix_updated', matrix);

    // Trigger Push Notification to Owner & Admin mobile devices after DB confirmation
    notificationService.sendCheckoutNotification({
      booking: result.booking,
      roomNumber: result.booking.roomNumber,
      isEarly: true
    }).catch(notifErr => console.warn('[FCM Early Checkout Push Alert Error]:', notifErr.message));

    return res.json({
      success: true,
      message: `Room ${result.booking.roomNumber} early check-out confirmed. Room moved to CLEANING.`,
      booking: result.booking,
      room: result.room
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Complete Housekeeping Cleaning -> Room AVAILABLE
exports.completeCleaning = async (req, res) => {
  try {
    const { roomNumber } = req.body;
    if (!roomNumber) return res.status(400).json({ success: false, message: 'Room number is required.' });

    const room = await db.completeCleaning(roomNumber);
    broadcastEvent('room_cleaned', { roomNumber, room });
    const matrix = await db.getRoomMatrix();
    broadcastEvent('matrix_updated', matrix);

    return res.json({
      success: true,
      message: `Housekeeping complete. Room ${roomNumber} is now Available.`,
      room
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Manual 5-State Room Status Update
exports.updateRoomStatus = async (req, res) => {
  try {
    const { roomNumber, status } = req.body;
    if (!roomNumber || !status) return res.status(400).json({ success: false, message: 'Room number and status are required.' });

    const room = await db.updateRoomStatus(roomNumber, status);
    broadcastEvent('room_status_changed', { roomNumber, status });
    const matrix = await db.getRoomMatrix();
    broadcastEvent('matrix_updated', matrix);

    return res.json({ success: true, message: `Room ${roomNumber} status updated to ${status}.`, room });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Add payment to booking ledger
exports.addPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, notes } = req.body;
    if (!bookingId || !amount) return res.status(400).json({ success: false, message: 'Booking ID and amount are required.' });

    const booking = await db.addBookingPayment(bookingId, { amount, paymentMethod, notes });
    broadcastEvent('payment_recorded', { bookingId, booking });
    const matrix = await db.getRoomMatrix();
    broadcastEvent('matrix_updated', matrix);

    return res.json({ success: true, message: 'Payment recorded successfully.', booking });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Swimming Pool Walk-in Pass
exports.createPoolPass = async (req, res) => {
  try {
    const pass = await db.createPoolPass(req.body);
    broadcastEvent('pool_pass_created', pass);
    return res.status(201).json({
      success: true,
      message: 'Swimming pool pass generated successfully!',
      pass
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Reports
exports.getReports = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'today';
    const targetDate = req.query.date || null;
    const reports = await db.getAdminReports(timeframe, targetDate);
    return res.json({ success: true, reports });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FCM PUSH NOTIFICATION CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

// Register or refresh Admin FCM Device Token
exports.registerDeviceToken = async (req, res) => {
  try {
    const { token, deviceName, platform } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Device token is required.' });
    }

    const adminUser = req.admin || { id: 'rushi@8001', name: 'Rushikesh Rohankar' };
    const registered = await notificationService.registerDeviceToken({
      token,
      adminId: adminUser.id || adminUser.email || 'rushi@8001',
      adminName: adminUser.name || 'Rushikesh Rohankar',
      deviceName: deviceName || 'Android Admin Mobile',
      platform: platform || 'android'
    });

    return res.json({
      success: true,
      message: 'FCM device token registered for automatic booking and checkout notifications.',
      device: registered
    });
  } catch (err) {
    console.error('Register device token error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Deactivate Admin FCM Device Token on logout or uninstall
exports.unregisterDeviceToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Device token is required.' });
    }
    await notificationService.unregisterDeviceToken(token);
    return res.json({ success: true, message: 'FCM device token unregistered successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Notification Audit Logs for Dashboard
exports.getNotificationLogs = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const logs = await notificationService.getNotificationLogs(limit);
    return res.json({
      success: true,
      isFirebaseReady: notificationService.isFirebaseReady(),
      count: logs.length,
      logs
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
