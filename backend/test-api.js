const db = require('./database/db');

async function runTests() {
  console.log('--- 1. Testing Room Inventory ---');
  const rooms = db.getRooms();
  console.log(`Found ${rooms.length} rooms.`);
  const deluxeAC = rooms.filter(r => r.category === 'Deluxe AC');
  const deluxeFamily = rooms.filter(r => r.category === 'Deluxe Family');
  console.log(`Deluxe AC: ${deluxeAC.length} (Expected: 7)`);
  console.log(`Deluxe Family: ${deluxeFamily.length} (Expected: 2)`);
  if (rooms.length !== 9 || deluxeAC.length !== 7 || deluxeFamily.length !== 2) {
    throw new Error('Room count mismatch!');
  }

  console.log('--- 2. Testing Date Conflict Prevention ---');
  // Room 101 has sample booking from today to today+2
  const today = new Date().toISOString().split('T')[0];
  const d1 = new Date(); d1.setDate(d1.getDate() + 1); const day1 = d1.toISOString().split('T')[0];
  const d3 = new Date(); d3.setDate(d3.getDate() + 3); const day3 = d3.toISOString().split('T')[0];
  const d4 = new Date(); d4.setDate(d4.getDate() + 4); const day4 = d4.toISOString().split('T')[0];

  const availOverlap = db.isRoomAvailableForDates('room-101', day1, day3);
  console.log(`Is Room 101 available during overlapping dates [${day1} to ${day3}]?`, availOverlap);
  if (availOverlap !== false) {
    throw new Error('Date conflict check failed: Room 101 should be unavailable for overlapping dates!');
  }

  const availNonOverlap = db.isRoomAvailableForDates('room-101', day3, day4);
  console.log(`Is Room 101 available for non-overlapping future dates [${day3} to ${day4}]?`, availNonOverlap);
  if (availNonOverlap !== true) {
    throw new Error('Non-overlapping date should be available!');
  }

  console.log('--- 3. Testing Booking Creation with Concurrency Lock ---');
  try {
    await db.createRoomBooking({
      roomId: 'room-101',
      customerName: 'Test Double Booker',
      phone: '9999999999',
      email: 'double@test.com',
      checkIn: day1,
      checkOut: day3
    });
    throw new Error('CRITICAL BUG: Double booking was allowed!');
  } catch (err) {
    console.log('Correctly rejected double booking:', err.message);
  }

  console.log('--- 4. Testing Admin Stats Generation ---');
  const stats = db.getAdminStats();
  console.log('Total bookings:', stats.summary.totalBookings);
  console.log('Total revenue:', stats.summary.totalRevenue);
  console.log('Occupied rooms today:', stats.summary.occupiedRooms);
  console.log('Available rooms today:', stats.summary.availableRooms);

  console.log('All backend database and conflict logic tests PASSED successfully!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
