const http = require('http');
const express = require('express');
const path = require('path');

// We will launch the actual server and run HTTP fetch requests against it
async function runE2E() {
  console.log('--- Starting Sadguru Resort End-to-End Suite ---');
  
  // Start server on test port 5055
  process.env.PORT = '5055';
  const server = require('./server');

  // Allow 500ms for startup
  await new Promise(r => setTimeout(r, 600));

  const BASE = 'http://127.0.0.1:5055';

  const req = async (path, options = {}) => {
    const res = await fetch(`${BASE}${path}`, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return { status: res.status, ok: res.ok, data: await res.json() };
    }
    return { status: res.status, ok: res.ok, text: await res.text() };
  };

  // Test 1: Health
  console.log('1. Testing /api/health...');
  const health = await req('/api/health');
  console.log('Health Response:', health.status, health.data.service);
  if (!health.ok) throw new Error('Health check failed');

  // Test 2: Rooms
  console.log('2. Testing /api/rooms...');
  const rooms = await req('/api/rooms');
  console.log('Rooms count:', rooms.data.totalRooms);
  if (rooms.data.totalRooms !== 9) throw new Error('Expected 9 rooms');

  // Test 3: Check Availability
  console.log('3. Testing /api/rooms/check-availability...');
  const avail = await req('/api/rooms/check-availability?checkIn=2026-12-01&checkOut=2026-12-03');
  console.log('Available rooms in Dec:', avail.data.availableCount);

  // Test 4: Create Valid Booking
  console.log('4. Testing POST /api/bookings...');
  const bookRes = await req('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomId: 'room-102',
      customerName: 'Suresh Patil',
      phone: '+91 98221 99999',
      email: 'suresh.patil@test.com',
      checkIn: '2026-12-01',
      checkOut: '2026-12-03',
      guests: 2
    })
  });
  console.log('Booking Result:', bookRes.status, bookRes.data.booking?.id);
  if (!bookRes.ok) throw new Error(`Booking failed: ${bookRes.data.message}`);

  // Test 5: Verify Conflict Prevention (overlapping booking on same room)
  console.log('5. Testing Overlap Conflict Prevention...');
  const conflictRes = await req('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomId: 'room-102',
      customerName: 'Intruder Booking',
      phone: '+91 90000 00000',
      email: 'intruder@test.com',
      checkIn: '2026-12-02', // Overlaps with 2026-12-01 to 2026-12-03
      checkOut: '2026-12-04',
      guests: 2
    })
  });
  console.log('Conflict Result status:', conflictRes.status, 'Message:', conflictRes.data.message);
  if (conflictRes.status !== 409) {
    throw new Error('CRITICAL: Conflicting overlapping booking was NOT rejected!');
  }

  // Test 6: Swimming Pool Booking
  console.log('6. Testing POST /api/pool...');
  const poolRes = await req('/api/pool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Ramesh Swimming Guest',
      phone: '+91 98888 77777',
      date: '2026-12-05',
      timeSlot: '04:00 PM - 07:00 PM',
      adultCount: 2,
      childCount: 1
    })
  });
  console.log('Pool Pass ID:', poolRes.data.booking?.id, 'Total:', poolRes.data.booking?.totalAmount);

  // Test 7: Admin Login
  console.log('7. Testing POST /api/auth/login...');
  const loginRes = await req('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@sadgururesort.com',
      password: 'Admin@123'
    })
  });
  console.log('Login Result:', loginRes.data.message, 'Role:', loginRes.data.admin?.role);
  if (!loginRes.data.token) throw new Error('No token returned from admin login');
  const token = loginRes.data.token;

  // Test 8: Admin Protected Stats
  console.log('8. Testing GET /api/admin/stats with JWT token...');
  const statsRes = await req('/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Stats Summary:', statsRes.data.stats?.summary);

  // Test 9: Frontend Serving
  console.log('9. Testing GET / (Frontend SPA bundle delivery)...');
  const frontendRes = await req('/');
  console.log('Frontend response status:', frontendRes.status, 'Length:', frontendRes.text?.length);
  if (!frontendRes.text.includes('Sadguru Resort')) {
    throw new Error('Frontend does not contain Sadguru Resort title');
  }

  console.log('--------------------------------------------------');
  console.log('  ALL END-TO-END VERIFICATION TESTS PASSED 100%!  ');
  console.log('--------------------------------------------------');
  process.exit(0);
}

runE2E().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
