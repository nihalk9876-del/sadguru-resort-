const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'sadguru_luxury_resort_secret_key_2026',
  JWT_EXPIRES_IN: '7d',
  DB_FILE: path.join(__dirname, '../database/data.json'),
  
  ROOM_CATEGORIES: {
    DELUXE_AC: 'Deluxe AC',
    DELUXE_FAMILY: 'Deluxe Family'
  },
  
  BOOKING_STATUS: {
    CONFIRMED: 'Confirmed',
    CHECKED_IN: 'Checked-In',
    CHECKED_OUT: 'Checked-Out',
    PENDING: 'Pending',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed'
  },
  
  PAYMENT_STATUS: {
    PAID: 'Paid',
    PARTIAL: 'Partial Advance',
    PENDING: 'Pending'
  },
  
  ROOM_STATUS: {
    AVAILABLE: 'Available',
    RESERVED: 'Reserved',
    OCCUPIED: 'Occupied',
    CLEANING: 'Cleaning',
    MAINTENANCE: 'Under Maintenance'
  }
};
