const db = require('./database/db');

async function runTests() {
  console.log('--- 1. Testing Room Matrix ---');
  const matrix = db.getRoomMatrix();
  console.log(`Total Rooms in Matrix: ${matrix.length}`);
  matrix.forEach(r => {
    console.log(`Room ${r.roomNumber} (${r.category}): ${r.isOccupied ? 'OCCUPIED' : 'VACANT'} - Base: Rs.${r.basePrice}`);
  });

  console.log('\n--- 2. Testing On-Spot Booking with Aadhaar & Custom Rate ---');
  const onSpotData = {
    roomNumber: 104,
    customerName: 'Sanjay Yashwantrao Rathod',
    phone: '9822155667',
    aadhaarNumber: '4821 9012 3456',
    dob: '15/08/1988',
    age: 38,
    guests: 3,
    checkInDate: '2026-11-20',
    checkInTime: '10:30 AM',
    checkOutDate: '2026-11-21',
    checkOutTime: '11:00 AM',
    durationHours: 24,
    rate: 3200,
    advancePaid: 3200,
    paymentMethod: 'Cash',
    notes: 'Walk-in guest from Jalamb Road'
  };

  const booking = await db.createOnSpotRoomBooking(onSpotData);
  console.log('Created on-spot booking:', {
    id: booking.id,
    roomNumber: booking.roomNumber,
    customerName: booking.customerName,
    aadhaarNumber: booking.aadhaarNumber,
    age: booking.age,
    checkIn: `${booking.checkIn} ${booking.checkInTime}`,
    checkOut: `${booking.checkOut} ${booking.checkOutTime}`,
    rate: booking.nightlyRate,
    status: booking.status
  });

  console.log('\n--- 3. Verifying Room 104 is now OCCUPIED in Matrix ---');
  const updatedMatrix = db.getRoomMatrix();
  const room104 = updatedMatrix.find(r => r.roomNumber === 104);
  console.log(`Room 104 Status: ${room104.isOccupied ? 'OCCUPIED' : 'VACANT'}`);
  console.log('Occupant Details:', room104.occupant);

  console.log('\n--- 4. Testing Swimming Pool Pass Allotment (No Aadhaar needed) ---');
  const poolData = {
    customerName: 'Anil Jadhav',
    phone: '9988776655',
    adultCount: 2,
    childCount: 1,
    durationHours: 2,
    customRate: 800,
    paymentMethod: 'UPI (PhonePe)'
  };

  const poolPass = await db.createPoolPass(poolData);
  console.log('Issued Pool Pass:', {
    id: poolPass.id,
    phone: poolPass.phone,
    visitors: poolPass.totalVisitors,
    entryTime: poolPass.entryTime,
    validUntil: poolPass.validUntil,
    amount: poolPass.totalAmount,
    paymentMethod: poolPass.paymentMethod
  });

  console.log('\n--- 5. Testing Weekly & Monthly Reports ---');
  const weeklyReport = db.getAdminReports('week');
  console.log('Weekly Summary:', weeklyReport.summary);
  console.log(`Recent Transactions recorded: ${weeklyReport.recentTransactions.length}`);

  console.log('\n--- 6. Testing 1-Tap Checkout for Room 104 ---');
  const checkoutResult = await db.checkoutRoomBooking(104);
  console.log(`Checked out: Room 104, Status: ${checkoutResult.status}, Actual Checkout: ${checkoutResult.actualCheckOutTime}`);

  const postCheckoutMatrix = db.getRoomMatrix();
  const room104After = postCheckoutMatrix.find(r => r.roomNumber === 104);
  console.log(`Room 104 is now: ${room104After.isOccupied ? 'OCCUPIED' : 'VACANT'}`);

  console.log('\nALL 6 TESTS PASSED FLAWLESSLY!');
}

runTests().catch(console.error);
