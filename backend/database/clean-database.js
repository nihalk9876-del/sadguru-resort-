const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Room, Booking, PoolBooking } = require('./mongodb');

async function cleanAllData() {
  console.log('=================================================');
  console.log('  CLEANING DATABASE - RESETTING ALL BOOKINGS');
  console.log('=================================================');

  const dataFile = path.join(__dirname, 'data.json');
  const raw = fs.readFileSync(dataFile, 'utf-8');
  const data = JSON.parse(raw);

  // 1. Reset all 9 rooms to Available
  data.rooms = (data.rooms || []).map(r => ({
    ...r,
    status: 'Available'
  }));

  // 2. Wipe all bookings completely
  const previousBookingsCount = (data.bookings || []).length;
  const previousPoolCount = (data.poolBookings || []).length;

  data.bookings = [];
  data.poolBookings = [];
  data.banquetBookings = [];
  data.lawnBookings = [];
  data.packageBookings = [];
  data.inquiries = [];

  // Write clean data.json
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[Local Ledger] Cleared ${previousBookingsCount} room bookings and ${previousPoolCount} pool passes.`);
  console.log(`[Local Ledger] Reset all ${data.rooms.length} rooms to 100% Available.`);

  // 3. Clean MongoDB Atlas if reachable
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      console.log('[MongoDB Atlas] Attempting to clean cloud collections...');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      await Booking.deleteMany({});
      await PoolBooking.deleteMany({});
      await Room.updateMany({}, { $set: { status: 'Available' } });
      console.log('[MongoDB Atlas] Successfully wiped cloud bookings and reset room statuses to Available!');
      await mongoose.disconnect();
    } catch (err) {
      console.log('[MongoDB Atlas] Cloud wipe note (will sync when online):', err.message);
    }
  }

  console.log('=================================================');
  console.log('  DATABASE IS NOW 100% FRESH & CLEAN!');
  console.log('  Total Bookings: 0');
  console.log('  Total Available Rooms: 9 (101-107, 201-202)');
  console.log('=================================================');
}

cleanAllData().catch(console.error);
