const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Room, Booking, PoolBooking, connectMongo } = require('./mongodb');

async function syncAllToMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found.');
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB Atlas:', mongoose.connection.name);

  const dataFile = path.join(__dirname, 'data.json');
  const raw = fs.readFileSync(dataFile, 'utf-8');
  const data = JSON.parse(raw);

  // 1. Sync Rooms
  console.log(`Syncing ${data.rooms.length} rooms to MongoDB Atlas...`);
  for (const r of data.rooms) {
    await Room.findOneAndUpdate(
      { roomNumber: r.roomNumber },
      { $set: r },
      { upsert: true, new: true }
    );
  }
  const roomCount = await Room.countDocuments();
  console.log(`MongoDB Rooms Count: ${roomCount}`);

  // 2. Sync Bookings
  console.log(`Syncing ${(data.bookings || []).length} bookings to MongoDB Atlas...`);
  for (const b of (data.bookings || [])) {
    await Booking.findOneAndUpdate(
      { id: b.id },
      { $set: b },
      { upsert: true, new: true }
    );
  }
  const bookingCount = await Booking.countDocuments();
  console.log(`MongoDB Bookings Count: ${bookingCount}`);

  // 3. Sync Pool Bookings
  console.log(`Syncing ${(data.poolBookings || []).length} pool bookings to MongoDB Atlas...`);
  for (const p of (data.poolBookings || [])) {
    await PoolBooking.findOneAndUpdate(
      { id: p.id },
      { $set: p },
      { upsert: true, new: true }
    );
  }
  const poolCount = await PoolBooking.countDocuments();
  console.log(`MongoDB Pool Passes Count: ${poolCount}`);

  console.log('\nALL DATA SUCCESSFULLY SYNCHRONIZED TO MONGODB ATLAS!');
  process.exit(0);
}

syncAllToMongo().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
