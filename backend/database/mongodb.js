const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// 1. ROOM SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// 2. BOOKING SCHEMA (Room Bookings)
// ─────────────────────────────────────────────────────────────────────────────
const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, default: 'room' },
  bookingSource: { type: String, default: 'on_spot_walkin' },
  roomId: { type: String },
  roomNumber: { type: Number },
  roomName: { type: String },
  category: { type: String },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  aadhaarNumber: { type: String },
  dob: { type: String },
  age: { type: Number },
  stayType: { type: String, default: 'Family' },
  secondGuestName: { type: String },
  secondGuestAge: { type: Number },
  secondGuestAadhaar: { type: String },
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
  allottedBy: { type: String, default: 'Admin (App)' },
  cancellationReason: { type: String },
  cancelledAt: { type: String },
  notes: { type: String },
  createdAt: { type: String }
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────────────────
// 3. POOL BOOKING SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
const PoolBookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, default: 'swimming_pool' },
  bookingSource: { type: String, default: 'pool_walkin_app' },
  customerName: { type: String, default: 'Walk-in Swimmer' },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  entryTime: { type: String },
  slot: { type: String },
  durationHours: { type: Number, default: 2 },
  validUntil: { type: String },
  adultCount: { type: Number, default: 1 },
  childCount: { type: Number, default: 0 },
  totalVisitors: { type: Number, default: 1 },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'Paid' },
  paymentMethod: { type: String, default: 'Cash' },
  status: { type: String, default: 'Active' },
  notes: { type: String },
  createdAt: { type: String }
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────────────────
// 4. SETTINGS SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  resortName: { type: String, default: 'Sadguru Resort' },
  tagline: { type: String, default: 'Where luxury meets tranquillity.' },
  phone: { type: String, default: '+91 98220 11223' },
  whatsapp: { type: String, default: '+91 98220 11223' },
  email: { type: String, default: 'contact@sadgururesort.com' },
  address: { type: String },
  poolTimings: { type: String, default: '06:00 AM - 09:00 PM' },
  adultPoolTicket: { type: Number, default: 350 },
  childPoolTicket: { type: Number, default: 200 },
  banquetCapacity: { type: Number, default: 500 },
  lawnAreaSqFt: { type: String, default: '25,000+ sq.ft' },
  taxPercentage: { type: Number, default: 12 }
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────────────────
// 5. REVENUE ARCHIVE SCHEMA (Lifetime revenue, never resets)
// ─────────────────────────────────────────────────────────────────────────────
const RevenueArchiveSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  historicalTotalRevenue: { type: Number, default: 0 },
  historicalRoomBookingsCount: { type: Number, default: 0 },
  historicalPoolPassesCount: { type: Number, default: 0 },
  monthlySummary: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────────────────────────────────────
const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
const PoolBooking = mongoose.models.PoolBooking || mongoose.model('PoolBooking', PoolBookingSchema);
const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
const RevenueArchive = mongoose.models.RevenueArchive || mongoose.model('RevenueArchive', RevenueArchiveSchema);

let isConnected = false;

async function connectMongo() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.log('[Database] No MONGODB_URI found in environment. Using JSON fallback.');
    return false;
  }

  try {
    if (isConnected) return true;
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    isConnected = true;

    console.log('=================================================');
    console.log('  MONGODB ATLAS DATABASE CONNECTED SUCCESSFULLY!');
    console.log('  URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    console.log('=================================================');

    // Auto-seed rooms from data.json if not already in Atlas
    try {
      const roomCount = await Room.countDocuments();
      if (roomCount < 9) {
        const data = require('./data.json');
        if (data.rooms && data.rooms.length > 0) {
          for (const r of data.rooms) {
            await Room.findOneAndUpdate({ roomNumber: r.roomNumber }, r, { upsert: true, new: true });
          }
          console.log(`  [Seed] Synced ${data.rooms.length} rooms to MongoDB Atlas.`);
        }
      } else {
        console.log(`  [Atlas] ${roomCount} rooms verified in Atlas.`);
      }
    } catch (seedErr) {
      console.warn('  [Seed Warning]:', seedErr.message);
    }

    // Auto-seed settings if not present
    try {
      const settingsCount = await Settings.countDocuments();
      if (settingsCount === 0) {
        await Settings.create({
          key: 'global',
          resortName: 'Sadguru Resort',
          tagline: 'Where luxury meets tranquillity.',
          phone: '+91 98220 11223',
          whatsapp: '+91 98220 11223',
          email: 'contact@sadgururesort.com',
          address: 'Near Dnyaneshwar Mandir, Jalamb Road, Shegaon - 444203, Maharashtra, India',
          poolTimings: '06:00 AM - 09:00 PM',
          adultPoolTicket: 350,
          childPoolTicket: 200,
          banquetCapacity: 500,
          lawnAreaSqFt: '25,000+ sq.ft',
          taxPercentage: 12
        });
        console.log('  [Seed] Default settings saved to Atlas.');
      }
    } catch (settErr) {
      console.warn('  [Settings Seed Warning]:', settErr.message);
    }

    return true;
  } catch (err) {
    console.error('[Database] MongoDB connection failed:', err.message);
    isConnected = false;
    return false;
  }
}

module.exports = {
  connectMongo,
  Room,
  Booking,
  PoolBooking,
  Settings,
  RevenueArchive,
  getIsConnected: () => isConnected
};
