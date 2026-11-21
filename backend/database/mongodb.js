const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// 1. Room Schema
const RoomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roomNumber: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, default: 3 },
  bedType: { type: String, default: '1 King Size Bed' },
  sizeSqFt: { type: Number, default: 380 },
  view: { type: String, default: 'Pool & Garden View' },
  description: { type: String },
  amenities: [{ type: String }],
  images: [{ type: String }],
  status: { type: String, default: 'Available' },
  floor: { type: String, default: '1st Floor' }
}, { timestamps: true });

// 2. Booking Schema
const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, default: 'room' },
  bookingSource: { type: String, default: 'online_website' },
  roomId: { type: String },
  roomNumber: { type: Number },
  roomName: { type: String },
  category: { type: String },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  aadhaarNumber: { type: String },
  dob: { type: String },
  age: { type: Number },
  guests: { type: Number, default: 2 },
  adults: { type: Number, default: 2 },
  children: { type: Number, default: 0 },
  checkIn: { type: String, required: true },
  checkInTime: { type: String, default: '12:00 PM' },
  checkOut: { type: String, required: true },
  checkOutTime: { type: String, default: '11:00 AM' },
  durationHours: { type: Number, default: 24 },
  nights: { type: Number, default: 1 },
  nightlyRate: { type: Number },
  subtotal: { type: Number },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  paymentStatus: { type: String, default: 'Paid' },
  status: { type: String, default: 'Confirmed' },
  actualCheckOut: { type: String },
  actualCheckOutTime: { type: String },
  originalExpectedCheckOut: { type: String },
  isEarlyCheckout: { type: Boolean, default: false },
  payments: [{
    id: { type: String },
    amount: { type: Number },
    method: { type: String },
    date: { type: String },
    notes: { type: String }
  }],
  idType: { type: String, default: 'Aadhaar' },
  idMasked: { type: String },
  specialRequests: { type: String },
  allottedBy: { type: String, default: 'System' }
}, { timestamps: true });

// 3. Pool Booking Schema
const PoolBookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, default: 'swimming_pool' },
  bookingSource: { type: String, default: 'pool_walkin_app' },
  customerName: { type: String, default: 'Walk-in Swimmer' },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  entryTime: { type: String },
  durationHours: { type: Number, default: 2 },
  validUntil: { type: String },
  adultCount: { type: Number, default: 1 },
  childCount: { type: Number, default: 0 },
  totalVisitors: { type: Number, default: 1 },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'Paid' },
  paymentMethod: { type: String, default: 'Cash' },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

// Models
const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
const PoolBooking = mongoose.models.PoolBooking || mongoose.model('PoolBooking', PoolBookingSchema);

let isConnected = false;

async function connectMongo() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.log('[Database] No MONGODB_URI found in environment. Using synchronized JSON ledger fallback.');
    return false;
  }

  try {
    if (isConnected) return true;
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log('=================================================');
    console.log('  MONGODB DATABASE CONNECTED SUCCESSFULLY!');
    console.log('  URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    console.log('=================================================');

    // Auto-sync rooms to MongoDB Atlas if not present
    try {
      const roomCount = await Room.countDocuments();
      if (roomCount < 9) {
        const data = require('./data.json');
        if (data.rooms && data.rooms.length > 0) {
          for (const r of data.rooms) {
            await Room.findOneAndUpdate({ roomNumber: r.roomNumber }, r, { upsert: true, new: true });
          }
          console.log(`  [MongoDB Atlas] Successfully seeded ${data.rooms.length} resort rooms to Atlas!`);
        }
      } else {
        console.log(`  [MongoDB Atlas] Verified ${roomCount} rooms active in Atlas.`);
      }
    } catch (syncErr) {
      console.warn('  [MongoDB Atlas Sync Warning]:', syncErr.message);
    }

    return true;
  } catch (err) {
    console.error('[Database] MongoDB connection failed:', err.message);
    return false;
  }
}

module.exports = {
  connectMongo,
  Room,
  Booking,
  PoolBooking,
  getIsConnected: () => isConnected
};
