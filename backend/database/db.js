/**
 * SADGURU RESORT — MongoDB-First Database Layer
 * All reads and writes go directly to MongoDB Atlas.
 * JSON file (data.json) is used only as a one-time room seed on first startup.
 */

const { BOOKING_STATUS, ROOM_STATUS } = require('../config/constants');
const { Room, Booking, PoolBooking, Settings, RevenueArchive } = require('./mongodb');

// ─────────────────────────────────────────────────────────────────────────────
// HELPER UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function normalizeDateStr(d) {
  if (!d) return '';
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return String(d).split('T')[0];
  return dateObj.toISOString().split('T')[0];
}

function isDateOverlap(startA, endA, startB, endB) {
  const sA = new Date(normalizeDateStr(startA) + 'T00:00:00Z').getTime();
  const eA = new Date(normalizeDateStr(endA) + 'T00:00:00Z').getTime();
  const sB = new Date(normalizeDateStr(startB) + 'T00:00:00Z').getTime();
  const eB = new Date(normalizeDateStr(endB) + 'T00:00:00Z').getTime();
  return sA < eB && eA > sB;
}

function calculateNights(checkIn, checkOut) {
  const s = new Date(normalizeDateStr(checkIn) + 'T00:00:00Z').getTime();
  const e = new Date(normalizeDateStr(checkOut) + 'T00:00:00Z').getTime();
  return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
}

function normalizeCategory(cat) {
  if (!cat) return null;
  const lower = cat.toLowerCase();
  if (lower.includes('family') || lower.includes('double')) return 'Deluxe Family';
  return 'Deluxe AC';
}

function genBookingId(prefix, count) {
  const year = new Date().getFullYear();
  return `SR-${prefix}-${year}-${String(count).padStart(4, '0')}`;
}

async function getSettings() {
  let s = await Settings.findOne({ key: 'global' }).lean();
  if (!s) s = { adultPoolTicket: 350, childPoolTicket: 200, taxPercentage: 12 };
  return s;
}

async function getArchive() {
  let a = await RevenueArchive.findOne({ key: 'global' }).lean();
  if (!a) {
    a = await RevenueArchive.create({ key: 'global' });
  }
  return a;
}

// ─────────────────────────────────────────────────────────────────────────────
// DB MODULE
// ─────────────────────────────────────────────────────────────────────────────
const db = {

  // ───────────────────────────────────────────────────────────────────────────
  // ROOMS
  // ───────────────────────────────────────────────────────────────────────────
  getRooms: async () => {
    const rooms = await Room.find().sort({ roomNumber: 1 }).lean();
    const todayStr = new Date().toISOString().split('T')[0];
    const bookings = await Booking.find({
      status: { $nin: [BOOKING_STATUS.CANCELLED, 'Completed', 'Checked-Out'] }
    }).lean();

    return rooms.map(room => {
      if (room.status === ROOM_STATUS.MAINTENANCE) return { ...room, isOccupied: false };

      const activeBooking = bookings.find(b => {
        if (String(b.roomNumber) !== String(room.roomNumber)) return false;
        if (b.status === 'Checked-In') return true;
        const ci = normalizeDateStr(b.checkIn);
        const co = normalizeDateStr(b.checkOut);
        return todayStr >= ci && todayStr <= co;
      });

      return {
        ...room,
        isOccupied: !!activeBooking,
        status: activeBooking ? 'Occupied' : room.status,
        occupant: activeBooking ? {
          bookingId: activeBooking.id,
          customerName: activeBooking.customerName,
          phone: activeBooking.phone,
          checkIn: activeBooking.checkIn,
          checkInTime: activeBooking.checkInTime || '12:00 PM',
          checkOut: activeBooking.checkOut,
          checkOutTime: activeBooking.checkOutTime || '11:00 AM',
          totalAmount: activeBooking.totalAmount,
          advancePaid: activeBooking.advancePaid,
          paymentMethod: activeBooking.paymentMethod || 'Cash'
        } : null
      };
    });
  },

  getRoomById: async (id) => {
    return Room.findOne({ $or: [{ id: String(id) }, { roomNumber: Number(id) }] }).lean();
  },

  updateRoom: async (id, updates) => {
    return Room.findOneAndUpdate(
      { $or: [{ id: String(id) }, { roomNumber: Number(id) }] },
      { ...updates, updatedAt: new Date().toISOString() },
      { new: true }
    ).lean();
  },

  isRoomAvailableForDates: async (roomId, checkIn, checkOut, excludeBookingId = null) => {
    const room = await Room.findOne({ $or: [{ id: String(roomId) }, { roomNumber: Number(roomId) }] }).lean();
    if (!room || room.status === ROOM_STATUS.MAINTENANCE) return false;

    const query = {
      roomNumber: room.roomNumber,
      status: { $nin: [BOOKING_STATUS.CANCELLED, 'Checked-Out', 'Completed'] }
    };
    if (excludeBookingId) query.id = { $ne: String(excludeBookingId) };

    const conflicts = await Booking.find(query).lean();
    return !conflicts.some(b => isDateOverlap(checkIn, checkOut, b.checkIn, b.checkOut));
  },

  getAvailableRooms: async (checkIn, checkOut, category = null, guests = null) => {
    const normIn = normalizeDateStr(checkIn);
    const normOut = normalizeDateStr(checkOut);
    const normCat = category ? normalizeCategory(category) : null;

    const roomQuery = { status: { $ne: ROOM_STATUS.MAINTENANCE } };
    if (normCat) roomQuery.category = { $regex: normCat, $options: 'i' };
    if (guests) roomQuery.capacity = { $gte: Number(guests) };

    const rooms = await Room.find(roomQuery).lean();
    const bookedRooms = new Set();

    const conflictBookings = await Booking.find({
      status: { $nin: [BOOKING_STATUS.CANCELLED] },
      checkIn: { $lt: normOut },
      checkOut: { $gt: normIn }
    }).lean();

    conflictBookings.forEach(b => bookedRooms.add(b.roomNumber));
    return rooms.filter(r => !bookedRooms.has(r.roomNumber));
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ROOM BOOKINGS (Online / Website)
  // ───────────────────────────────────────────────────────────────────────────
  createRoomBooking: async (bookingData) => {
    const normIn = normalizeDateStr(bookingData.checkIn);
    const normOut = normalizeDateStr(bookingData.checkOut);

    if (!normIn || !normOut) throw new Error('Valid check-in and check-out dates are required.');
    if (new Date(normIn) >= new Date(normOut)) throw new Error('Check-out must be after check-in.');

    let targetRoom = null;
    if (bookingData.roomId || bookingData.roomNumber) {
      const qId = bookingData.roomId || bookingData.roomNumber;
      targetRoom = await Room.findOne({ $or: [{ id: String(qId) }, { roomNumber: Number(qId) }] }).lean();
      if (!targetRoom) throw new Error(`Room ${qId} not found.`);
      if (targetRoom.status === ROOM_STATUS.MAINTENANCE) throw new Error(`Room ${targetRoom.roomNumber} is under maintenance.`);

      const conflict = await Booking.findOne({
        roomNumber: targetRoom.roomNumber,
        status: { $nin: [BOOKING_STATUS.CANCELLED] },
        checkIn: { $lt: normOut },
        checkOut: { $gt: normIn }
      }).lean();
      if (conflict) throw new Error('Room is already booked for the selected dates.');
    } else {
      const normCat = normalizeCategory(bookingData.category || 'Deluxe AC');
      const rooms = await Room.find({ status: { $ne: ROOM_STATUS.MAINTENANCE }, category: { $regex: normCat, $options: 'i' } }).lean();
      const bookedRooms = new Set();
      const conflicts = await Booking.find({
        status: { $nin: [BOOKING_STATUS.CANCELLED] },
        checkIn: { $lt: normOut },
        checkOut: { $gt: normIn }
      }).lean();
      conflicts.forEach(b => bookedRooms.add(b.roomNumber));
      const available = rooms.filter(r => !bookedRooms.has(r.roomNumber));
      if (available.length === 0) throw new Error('No rooms available for selected dates.');
      targetRoom = available[Math.floor(Math.random() * available.length)];
    }

    const count = await Booking.countDocuments();
    const bookingId = genBookingId('RM', count + 101);
    const settings = await getSettings();
    const nights = calculateNights(normIn, normOut);
    const nightlyRate = Number(bookingData.customPrice || bookingData.price || targetRoom.price);
    const subtotal = nightlyRate * nights;
    const taxAmount = Math.round(subtotal * ((settings.taxPercentage || 12) / 100));
    const totalAmount = subtotal + taxAmount;
    const advancePaid = bookingData.advancePaid !== undefined ? Number(bookingData.advancePaid) : totalAmount;
    const remainingBalance = Math.max(0, totalAmount - advancePaid);

    const newBooking = await Booking.create({
      id: bookingId,
      type: 'room',
      bookingSource: 'online_website',
      roomId: targetRoom.id,
      roomNumber: targetRoom.roomNumber,
      roomName: targetRoom.name,
      category: targetRoom.category,
      customerName: bookingData.customerName,
      phone: bookingData.phone,
      email: bookingData.email,
      address: bookingData.address || '',
      checkIn: normIn,
      checkOut: normOut,
      nights,
      guests: Number(bookingData.guests || 2),
      adults: Number(bookingData.adults || bookingData.guests || 2),
      children: Number(bookingData.children || 0),
      nightlyRate,
      subtotal,
      taxAmount,
      totalAmount,
      advancePaid,
      remainingBalance,
      paymentStatus: remainingBalance === 0 ? 'Paid' : (advancePaid > 0 ? 'Partial Advance' : 'Pending'),
      paymentMethod: bookingData.paymentMethod || 'Online / Card / UPI',
      status: bookingData.status || BOOKING_STATUS.CONFIRMED,
      specialRequests: bookingData.specialRequests || '',
      createdAt: new Date().toISOString()
    });

    return newBooking.toObject();
  },

  getBookings: async (filters = {}) => {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
    if (filters.category) query.category = filters.category;
    if (filters.search) {
      const q = filters.search;
      query.$or = [
        { id: { $regex: q, $options: 'i' } },
        { customerName: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    if (filters.date) {
      const d = normalizeDateStr(filters.date);
      query.checkIn = { $lte: d };
      query.checkOut = { $gte: d };
    }
    return Booking.find(query).sort({ createdAt: -1 }).lean();
  },

  getBookingById: async (id) => {
    return Booking.findOne({ id: { $regex: new RegExp(`^${id.trim()}$`, 'i') } }).lean();
  },

  getBookingByIdAndPhone: async (id, phone) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const booking = await Booking.findOne({ id: { $regex: new RegExp(`^${id.trim()}$`, 'i') } }).lean();
    if (!booking) return null;
    const bPhone = (booking.phone || '').replace(/[^0-9]/g, '');
    if (bPhone.endsWith(cleanPhone) || cleanPhone.endsWith(bPhone)) return booking;
    return null;
  },

  updateBookingStatus: async (bookingId, status, paymentStatus = null) => {
    const updates = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid') {
        const b = await Booking.findOne({ id: bookingId }).lean();
        if (b) { updates.advancePaid = b.totalAmount; updates.remainingBalance = 0; }
      }
    }
    return Booking.findOneAndUpdate({ id: bookingId }, updates, { new: true }).lean();
  },

  cancelBooking: async (bookingId, cancellationReason = 'Customer requested cancellation') => {
    return Booking.findOneAndUpdate(
      { id: bookingId },
      { status: BOOKING_STATUS.CANCELLED, cancellationReason, cancelledAt: new Date().toISOString() },
      { new: true }
    ).lean();
  },

  // ───────────────────────────────────────────────────────────────────────────
  // POOL BOOKINGS (Website)
  // ───────────────────────────────────────────────────────────────────────────
  createPoolBooking: async (poolData) => {
    const normDate = normalizeDateStr(poolData.date);
    if (!normDate) throw new Error('Date is required for pool booking.');

    const count = await PoolBooking.countDocuments();
    const bookingId = genBookingId('PL', count + 101);
    const settings = await getSettings();

    const adultCount = Number(poolData.adultCount || 1);
    const childCount = Number(poolData.childCount || 0);
    const totalAmount = (adultCount * (settings.adultPoolTicket || 350)) + (childCount * (settings.childPoolTicket || 200));

    const newBooking = await PoolBooking.create({
      id: bookingId,
      type: 'swimming_pool',
      customerName: poolData.customerName,
      phone: poolData.phone,
      email: poolData.email,
      date: normDate,
      slot: poolData.timeSlot || '04:00 PM - 07:00 PM',
      adultCount,
      childCount,
      totalVisitors: adultCount + childCount,
      totalAmount,
      paymentStatus: poolData.paymentStatus || 'Paid',
      paymentMethod: poolData.paymentMethod || 'UPI / Card',
      status: BOOKING_STATUS.CONFIRMED,
      notes: poolData.notes || '',
      createdAt: new Date().toISOString()
    });

    return newBooking.toObject();
  },

  getPoolBookings: async (filters = {}) => {
    const query = {};
    if (filters.date) query.date = normalizeDateStr(filters.date);
    if (filters.status) query.status = filters.status;
    return PoolBooking.find(query).sort({ createdAt: -1 }).lean();
  },

  // ───────────────────────────────────────────────────────────────────────────
  // SETTINGS
  // ───────────────────────────────────────────────────────────────────────────
  getSettings: async () => {
    return getSettings();
  },

  updateSettings: async (updates) => {
    return Settings.findOneAndUpdate(
      { key: 'global' },
      { ...updates, updatedAt: new Date().toISOString() },
      { new: true, upsert: true }
    ).lean();
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ADMIN STATS (Room matrix, occupancy, revenue)
  // ───────────────────────────────────────────────────────────────────────────
  getAdminStats: async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [allBookings, poolBookings, rooms] = await Promise.all([
      Booking.find().lean(),
      PoolBooking.find().lean(),
      Room.find().lean()
    ]);

    const totalRooms = rooms.length;
    const maintenanceRooms = rooms.filter(r => r.status === ROOM_STATUS.MAINTENANCE).length;

    const occupiedRoomNumbers = new Set();
    allBookings.forEach(b => {
      if (b.status !== BOOKING_STATUS.CANCELLED && b.checkIn <= todayStr && b.checkOut > todayStr) {
        occupiedRoomNumbers.add(b.roomNumber);
      }
    });

    const occupiedCount = occupiedRoomNumbers.size;
    const availableCount = Math.max(0, totalRooms - occupiedCount - maintenanceRooms);

    const todayBookings = allBookings.filter(b => b.checkIn === todayStr);
    const tomorrowBookings = allBookings.filter(b => b.checkIn === tomorrowStr);
    const upcomingBookings = allBookings.filter(b => b.checkIn > todayStr && b.status !== BOOKING_STATUS.CANCELLED);
    const completedBookings = allBookings.filter(b => b.checkOut <= todayStr && b.status !== BOOKING_STATUS.CANCELLED);
    const cancelledBookings = allBookings.filter(b => b.status === BOOKING_STATUS.CANCELLED);

    let totalRevenue = 0, pendingPayments = 0;
    allBookings.forEach(b => {
      if (b.status !== BOOKING_STATUS.CANCELLED) {
        totalRevenue += Number(b.advancePaid || b.totalAmount || 0);
        pendingPayments += Number(b.remainingBalance || 0);
      }
    });
    poolBookings.forEach(p => {
      if (p.status !== BOOKING_STATUS.CANCELLED) totalRevenue += Number(p.totalAmount || 0);
    });

    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      let dayRev = 0, dayBookingsCount = 0;
      allBookings.forEach(b => {
        const bookedOn = (b.createdAt || b.checkIn || '').split('T')[0];
        if (bookedOn === dateStr && b.status !== BOOKING_STATUS.CANCELLED) {
          dayRev += Number(b.advancePaid || b.totalAmount || 0);
          dayBookingsCount++;
        }
      });
      dailyStats.push({ date: dateStr, day: d.toLocaleDateString('en-US', { weekday: 'short' }), revenue: dayRev, bookings: dayBookingsCount });
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyStats = months.map((month, m) => {
      let monthRev = 0, count = 0;
      allBookings.forEach(b => {
        const bDate = new Date(b.createdAt || b.checkIn);
        if (bDate.getFullYear() === currentYear && bDate.getMonth() === m && b.status !== BOOKING_STATUS.CANCELLED) {
          monthRev += Number(b.advancePaid || b.totalAmount || 0);
          count++;
        }
      });
      return { month, revenue: monthRev, bookings: count };
    });

    return {
      summary: {
        totalBookings: allBookings.length,
        todayBookingsCount: todayBookings.length,
        tomorrowBookingsCount: tomorrowBookings.length,
        upcomingBookingsCount: upcomingBookings.length,
        completedBookingsCount: completedBookings.length,
        cancelledBookingsCount: cancelledBookings.length,
        totalRevenue,
        pendingPayments,
        totalRooms,
        availableRooms: availableCount,
        occupiedRooms: occupiedCount,
        maintenanceRooms,
        poolBookingsCount: poolBookings.length
      },
      todayBookings,
      tomorrowBookings,
      dailyStats,
      monthlyStats
    };
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ROOM MATRIX (Floor Plan — Live)
  // ───────────────────────────────────────────────────────────────────────────
  getRoomMatrix: async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [rooms, allBookings] = await Promise.all([
      Room.find().sort({ roomNumber: 1 }).lean(),
      Booking.find({ status: { $nin: [BOOKING_STATUS.CANCELLED, 'Completed', 'Checked-Out'] } }).lean()
    ]);

    return rooms.map(room => {
      const activeBooking = allBookings.find(b => {
        if (String(b.roomNumber) !== String(room.roomNumber)) return false;
        if (b.status === 'Checked-In') return true;
        const ci = normalizeDateStr(b.checkIn);
        const co = normalizeDateStr(b.checkOut);
        return todayStr >= ci && todayStr <= co;
      });

      const upcomingBooking = allBookings.find(b => {
        if (String(b.roomNumber) !== String(room.roomNumber)) return false;
        if (activeBooking && b.id === activeBooking.id) return false;
        if (!['Confirmed', 'Pending', 'Reserved'].includes(b.status)) return false;
        return normalizeDateStr(b.checkIn) >= todayStr;
      });

      let calculatedStatus = ROOM_STATUS.AVAILABLE;
      if (room.status === ROOM_STATUS.MAINTENANCE || room.status === 'Under Maintenance') {
        calculatedStatus = ROOM_STATUS.MAINTENANCE;
      } else if (room.status === ROOM_STATUS.CLEANING || room.status === 'Cleaning') {
        calculatedStatus = ROOM_STATUS.CLEANING;
      } else if (activeBooking) {
        calculatedStatus = activeBooking.status === 'Checked-In' ? ROOM_STATUS.OCCUPIED : ROOM_STATUS.RESERVED;
      } else if (upcomingBooking && upcomingBooking.checkIn === todayStr) {
        calculatedStatus = ROOM_STATUS.RESERVED;
      }

      const isOccupied = calculatedStatus === ROOM_STATUS.OCCUPIED || calculatedStatus === ROOM_STATUS.RESERVED;
      const occupantBooking = activeBooking || (calculatedStatus === ROOM_STATUS.RESERVED ? upcomingBooking : null);

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        name: room.name,
        category: room.category,
        basePrice: room.price,
        capacity: room.capacity,
        floor: room.floor || (String(room.roomNumber).startsWith('2') ? '2nd Floor' : '1st Floor'),
        status: calculatedStatus,
        rawStatus: room.status,
        isOccupied: Boolean(isOccupied && occupantBooking),
        occupant: (isOccupied && occupantBooking) ? {
          bookingId: occupantBooking.id,
          customerName: occupantBooking.customerName,
          phone: occupantBooking.phone,
          aadhaarNumber: occupantBooking.aadhaarNumber || 'Not Recorded',
          age: occupantBooking.age || null,
          dob: occupantBooking.dob || null,
          stayType: occupantBooking.stayType || 'Family',
          secondGuestName: occupantBooking.secondGuestName || null,
          secondGuestAge: occupantBooking.secondGuestAge || null,
          secondGuestAadhaar: occupantBooking.secondGuestAadhaar || null,
          guests: occupantBooking.guests || 2,
          adults: occupantBooking.adults || 2,
          children: occupantBooking.children || 0,
          checkIn: occupantBooking.checkIn,
          checkInTime: occupantBooking.checkInTime || '12:00 PM',
          checkOut: occupantBooking.checkOut,
          checkOutTime: occupantBooking.checkOutTime || '11:00 AM',
          occupiedUntil: `${occupantBooking.checkOut} ${occupantBooking.checkOutTime || '11:00 AM'}`,
          durationHours: occupantBooking.durationHours || null,
          allottedRate: occupantBooking.nightlyRate || occupantBooking.totalAmount,
          totalAmount: occupantBooking.totalAmount,
          advancePaid: occupantBooking.advancePaid,
          remainingBalance: occupantBooking.remainingBalance || 0,
          paymentMethod: occupantBooking.paymentMethod || 'Cash',
          paymentStatus: occupantBooking.paymentStatus || 'Paid',
          bookingSource: occupantBooking.bookingSource || 'walk-in',
          status: occupantBooking.status
        } : null,
        upcoming: upcomingBooking ? {
          bookingId: upcomingBooking.id,
          customerName: upcomingBooking.customerName,
          checkIn: upcomingBooking.checkIn,
          status: upcomingBooking.status
        } : null
      };
    });
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ON-SPOT ROOM BOOKING (Admin App — Walk-in with Aadhaar)
  // ───────────────────────────────────────────────────────────────────────────
  createOnSpotRoomBooking: async (bookingData) => {
    const {
      roomNumber,
      customerName,
      phone,
      aadhaarNumber,
      dob,
      age,
      stayType = 'Family',
      secondGuestName = null,
      secondGuestAge = null,
      secondGuestAadhaar = null,
      guests = 2,
      adults = 2,
      children = 0,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime = '11:00 AM',
      durationHours = 24,
      rate,
      advancePaid,
      paymentMethod = 'Cash',
      notes = ''
    } = bookingData;

    if (!roomNumber) throw new Error('Room number is required.');
    if (!customerName || !customerName.trim()) throw new Error('Guest name is required.');
    if (!phone || !phone.trim()) throw new Error('Guest phone number is required.');

    const targetRoom = await Room.findOne({ $or: [{ roomNumber: Number(roomNumber) }, { id: String(roomNumber) }] }).lean();
    if (!targetRoom) throw new Error(`Room ${roomNumber} not found.`);
    if (targetRoom.status === ROOM_STATUS.MAINTENANCE) throw new Error(`Room ${roomNumber} is under maintenance.`);

    const normIn = normalizeDateStr(checkInDate || new Date().toISOString().split('T')[0]);
    const normOut = checkOutDate
      ? normalizeDateStr(checkOutDate)
      : (() => { const d = new Date(normIn); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })();

    const conflict = await Booking.findOne({
      roomNumber: targetRoom.roomNumber,
      status: { $nin: [BOOKING_STATUS.CANCELLED, 'Completed', 'Checked-Out'] },
      checkIn: { $lt: normOut },
      checkOut: { $gt: normIn }
    }).lean();

    if (conflict) throw new Error('Room is already booked for the selected time slot. Please select another room.');

    const count = await Booking.countDocuments();
    const bookingId = genBookingId('SPOT', count + 101);
    const nights = calculateNights(normIn, normOut);
    const nightlyRate = Number(rate !== undefined && rate !== '' ? rate : targetRoom.price);
    const totalAmount = nightlyRate * nights;
    const paid = advancePaid !== undefined && advancePaid !== '' ? Number(advancePaid) : totalAmount;
    const remainingBalance = Math.max(0, totalAmount - paid);
    const resolvedCheckInTime = checkInTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newBooking = await Booking.create({
      id: bookingId,
      type: 'room',
      bookingSource: 'on_spot_walkin',
      roomId: targetRoom.id,
      roomNumber: targetRoom.roomNumber,
      roomName: targetRoom.name,
      category: targetRoom.category,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: bookingData.email || `walkin.${roomNumber}@sadgururesort.com`,
      aadhaarNumber: aadhaarNumber ? String(aadhaarNumber).trim() : null,
      dob: dob || null,
      age: age ? Number(age) : null,
      stayType: stayType === 'Couple' ? 'Couple' : 'Family',
      secondGuestName: secondGuestName ? String(secondGuestName).trim() : null,
      secondGuestAge: secondGuestAge ? Number(secondGuestAge) : null,
      secondGuestAadhaar: secondGuestAadhaar ? String(secondGuestAadhaar).trim() : null,
      guests: Number(guests),
      adults: Number(adults),
      children: Number(children),
      checkIn: normIn,
      checkInTime: resolvedCheckInTime,
      checkOut: normOut,
      checkOutTime,
      durationHours: Number(durationHours) || (nights * 24),
      nights,
      nightlyRate,
      subtotal: totalAmount,
      taxAmount: 0,
      totalAmount,
      advancePaid: paid,
      remainingBalance,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: remainingBalance === 0 ? 'Paid' : 'Partial Advance',
      status: 'Checked-In',
      specialRequests: notes,
      allottedBy: 'Admin (App)',
      createdAt: new Date().toISOString()
    });

    return newBooking.toObject();
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CHECKOUT & HOUSEKEEPING
  // ───────────────────────────────────────────────────────────────────────────
  earlyCheckoutRoomBooking: async (roomNumberOrId, actualCheckOutTime) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const checkOutTimeStr = actualCheckOutTime || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const targetRoom = await Room.findOne({
      $or: [{ roomNumber: Number(roomNumberOrId) }, { id: String(roomNumberOrId) }]
    }).lean();

    const activeBookings = await Booking.find({
      $or: [
        { roomNumber: Number(roomNumberOrId) },
        { roomId: String(roomNumberOrId) },
        { id: String(roomNumberOrId) }
      ],
      status: { $in: ['Checked-In', 'Confirmed', 'Reserved', 'Occupied', 'Pending'] }
    }).lean();

    if (!targetRoom && activeBookings.length === 0) throw new Error(`Room ${roomNumberOrId} not found.`);

    let lastCheckedOutBooking = null;

    for (const booking of activeBookings) {
      const updates = {
        status: 'Checked-Out',
        actualCheckOut: todayStr,
        actualCheckOutTime: checkOutTimeStr,
        originalExpectedCheckOut: `${booking.checkOut} ${booking.checkOutTime || '11:00 AM'}`,
        isEarlyCheckout: true,
        updatedAt: now.toISOString()
      };

      if ((booking.remainingBalance || 0) > 0) {
        const newPayment = {
          id: `PAY-CO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          amount: Number(booking.remainingBalance),
          method: booking.paymentMethod || 'Cash',
          date: now.toISOString(),
          notes: 'Settled at Check-Out'
        };
        updates.advancePaid = (Number(booking.advancePaid) || 0) + Number(booking.remainingBalance);
        updates.remainingBalance = 0;
        updates.paymentStatus = 'Paid';
        updates.payments = [...(booking.payments || []), newPayment];
      }

      lastCheckedOutBooking = await Booking.findOneAndUpdate({ id: booking.id }, updates, { new: true }).lean();
    }

    let updatedRoom = null;
    if (targetRoom) {
      updatedRoom = await Room.findOneAndUpdate(
        { roomNumber: targetRoom.roomNumber },
        { status: ROOM_STATUS.CLEANING, updatedAt: now.toISOString() },
        { new: true }
      ).lean();
    }

    return {
      booking: lastCheckedOutBooking || { roomNumber: roomNumberOrId, status: 'Checked-Out', customerName: 'Guest' },
      room: updatedRoom || targetRoom
    };
  },

  completeCleaning: async (roomNumberOrId) => {
    const room = await Room.findOneAndUpdate(
      { $or: [{ roomNumber: Number(roomNumberOrId) }, { id: String(roomNumberOrId) }] },
      { status: ROOM_STATUS.AVAILABLE, updatedAt: new Date().toISOString() },
      { new: true }
    ).lean();
    if (!room) throw new Error(`Room ${roomNumberOrId} not found.`);
    return room;
  },

  updateRoomStatus: async (roomNumberOrId, newStatus) => {
    const room = await Room.findOneAndUpdate(
      { $or: [{ roomNumber: Number(roomNumberOrId) }, { id: String(roomNumberOrId) }] },
      { status: newStatus, updatedAt: new Date().toISOString() },
      { new: true }
    ).lean();
    if (!room) throw new Error(`Room ${roomNumberOrId} not found.`);
    return room;
  },

  checkoutRoomBooking: async (roomNumberOrId) => {
    const res = await db.earlyCheckoutRoomBooking(roomNumberOrId);
    return res.booking;
  },

  addBookingPayment: async (bookingId, paymentData) => {
    const booking = await Booking.findOne({ id: bookingId }).lean();
    if (!booking) throw new Error(`Booking ${bookingId} not found.`);

    const pAmount = Number(paymentData.amount) || 0;
    if (pAmount <= 0) throw new Error('Payment amount must be greater than 0.');

    const newPayment = {
      id: `PAY-${Date.now()}`,
      amount: pAmount,
      method: paymentData.paymentMethod || 'Cash',
      date: new Date().toISOString(),
      notes: paymentData.notes || ''
    };
    const newAdvance = (Number(booking.advancePaid) || 0) + pAmount;
    const newBalance = Math.max(0, Number(booking.totalAmount) - newAdvance);

    return Booking.findOneAndUpdate(
      { id: bookingId },
      {
        $push: { payments: newPayment },
        advancePaid: newAdvance,
        remainingBalance: newBalance,
        paymentStatus: newBalance === 0 ? 'Paid' : 'Partial Advance',
        updatedAt: new Date().toISOString()
      },
      { new: true }
    ).lean();
  },

  // ───────────────────────────────────────────────────────────────────────────
  // POOL PASS (Admin App — Walk-in)
  // ───────────────────────────────────────────────────────────────────────────
  createPoolPass: async (passData) => {
    const {
      phone,
      guestCount = 1,
      adultCount = 1,
      childCount = 0,
      durationHours = 2,
      customerName = 'Walk-in Swimmer',
      customRate,
      paymentMethod = 'Cash'
    } = passData;

    if (!phone || !phone.trim()) throw new Error('Guest mobile number is required.');

    const count = await PoolBooking.countDocuments();
    const passId = `SR-PL-PASS-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;
    const settings = await getSettings();

    const adultRate = settings.adultPoolTicket || 350;
    const childRate = settings.childPoolTicket || 200;
    const defaultTotal = (Number(adultCount) * adultRate) + (Number(childCount) * childRate);
    const totalAmount = customRate !== undefined && customRate !== '' ? Number(customRate) : defaultTotal;

    const now = new Date();
    const entryTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const validUntilDate = new Date(now.getTime() + (Number(durationHours) || 2) * 60 * 60 * 1000);
    const validUntil = validUntilDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newPass = await PoolBooking.create({
      id: passId,
      type: 'swimming_pool',
      bookingSource: 'pool_walkin_app',
      customerName: customerName ? customerName.trim() : 'Guest Swimmer',
      phone: phone.trim(),
      date: now.toISOString().split('T')[0],
      entryTime,
      slot: entryTime,
      durationHours: Number(durationHours) || 2,
      validUntil,
      adultCount: Number(adultCount),
      childCount: Number(childCount),
      totalVisitors: Number(guestCount) || (Number(adultCount) + Number(childCount)),
      totalAmount,
      paymentStatus: 'Paid',
      paymentMethod: paymentMethod || 'Cash',
      status: 'Active',
      createdAt: now.toISOString()
    });

    return newPass.toObject();
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ADMIN REPORTS (5 KPIs + Today Ledger)
  // ───────────────────────────────────────────────────────────────────────────
  getAdminReports: async (timeframe = 'today', targetDate = null) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonthKey = todayStr.substring(0, 7);

    const [allBookings, allPoolBookings, archive] = await Promise.all([
      Booking.find({ status: { $ne: BOOKING_STATUS.CANCELLED } }).lean(),
      PoolBooking.find({ status: { $ne: BOOKING_STATUS.CANCELLED } }).lean(),
      getArchive()
    ]);

    const getBookingRev = (b) => {
      if (b.payments && b.payments.length > 0) return b.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
      if (b.status === 'Checked-Out' || b.status === 'Completed') return Number(b.totalAmount || b.advancePaid || 0);
      return Number(b.advancePaid !== undefined && b.advancePaid !== '' ? b.advancePaid : b.totalAmount) || 0;
    };

    // ── KPI 1: Today bookings
    const todayRoomBookingCount = allBookings.filter(b => {
      const ci = (b.checkIn || '').split('T')[0];
      const cr = (b.createdAt || '').split('T')[0];
      return ci === todayStr || cr === todayStr;
    }).length;

    // ── KPI 2: Today revenue
    let todayRoomRevenue = 0;
    allBookings.forEach(b => {
      if (b.payments && b.payments.length > 0) {
        b.payments.forEach(p => { if ((p.date || '').split('T')[0] === todayStr) todayRoomRevenue += Number(p.amount) || 0; });
      } else {
        const bDate = (b.actualCheckOut || b.createdAt || b.checkIn || '').split('T')[0];
        if (bDate === todayStr) todayRoomRevenue += getBookingRev(b);
      }
    });

    let todayPoolRevenue = 0;
    allPoolBookings.forEach(p => {
      if ((p.date || p.createdAt || '').split('T')[0] === todayStr) todayPoolRevenue += Number(p.totalAmount || 0);
    });

    const todayRevenue = todayRoomRevenue + todayPoolRevenue;

    // ── KPI 3: Monthly bookings count
    const monthlyRoomBookingsCount = allBookings.filter(b => {
      const ci = (b.checkIn || '').substring(0, 7);
      const cr = (b.createdAt || '').substring(0, 7);
      return ci === currentMonthKey || cr === currentMonthKey;
    }).length;

    // ── KPI 4: Monthly revenue
    let monthlyRoomRevenue = Number(archive.monthlySummary?.[currentMonthKey]?.roomRevenue || 0);
    allBookings.forEach(b => {
      if (b.payments && b.payments.length > 0) {
        b.payments.forEach(p => { if ((p.date || '').substring(0, 7) === currentMonthKey) monthlyRoomRevenue += Number(p.amount) || 0; });
      } else {
        const bDate = (b.actualCheckOut || b.createdAt || b.checkIn || '').split('T')[0];
        if (bDate.substring(0, 7) === currentMonthKey) monthlyRoomRevenue += getBookingRev(b);
      }
    });

    let monthlyPoolRevenue = Number(archive.monthlySummary?.[currentMonthKey]?.poolRevenue || 0);
    allPoolBookings.forEach(p => {
      if ((p.date || p.createdAt || '').split('T')[0].substring(0, 7) === currentMonthKey) monthlyPoolRevenue += Number(p.totalAmount || 0);
    });
    const monthlyRevenue = monthlyRoomRevenue + monthlyPoolRevenue;

    // ── KPI 5: Lifetime revenue
    let allTimeRoomRev = 0, allTimePoolRev = 0;
    allBookings.forEach(b => { allTimeRoomRev += getBookingRev(b); });
    allPoolBookings.forEach(p => { allTimePoolRev += Number(p.totalAmount || 0); });
    const tillNowRevenue = (archive.historicalTotalRevenue || 0) + allTimeRoomRev + allTimePoolRev;

    // ── Today's ledger (rooms + pool for today, sorted by check-in time)
    const activeDateStr = targetDate || todayStr;

    const todayRoomBookings = allBookings.filter(b => {
      const inDate = (b.checkIn || '').split('T')[0];
      const outDate = (b.actualCheckOut || b.checkOut || inDate).split('T')[0];
      const createDate = (b.createdAt || '').split('T')[0];
      return (activeDateStr >= inDate && activeDateStr <= outDate) || createDate === activeDateStr || (b.actualCheckOut && b.actualCheckOut === activeDateStr);
    });

    const todayPoolBookings = allPoolBookings.filter(p => {
      return (p.date || p.createdAt || '').split('T')[0] === activeDateStr;
    });

    const dateReport = {
      date: activeDateStr,
      roomsBookedCount: todayRoomBookings.length,
      poolPassesCount: todayPoolBookings.length,
      roomRevenue: todayRoomBookings.reduce((s, b) => s + getBookingRev(b), 0),
      poolRevenue: todayPoolBookings.reduce((s, p) => s + Number(p.totalAmount || 0), 0),
      totalRevenue: 0,
      roomsBooked: todayRoomBookings.map(b => ({
        id: b.id,
        roomNumber: b.roomNumber,
        roomName: b.roomName,
        category: b.category,
        customerName: b.customerName,
        phone: b.phone,
        aadhaarNumber: b.aadhaarNumber || null,
        stayType: b.stayType || 'Family',
        secondGuestName: b.secondGuestName || null,
        secondGuestAge: b.secondGuestAge || null,
        secondGuestAadhaar: b.secondGuestAadhaar || null,
        amountBookedFor: getBookingRev(b),
        totalAmount: b.totalAmount,
        advancePaid: b.advancePaid,
        remainingBalance: b.remainingBalance || 0,
        checkIn: b.checkIn,
        checkInTime: b.checkInTime || '12:00 PM',
        checkOut: b.checkOut,
        checkOutTime: b.checkOutTime || '11:00 AM',
        actualCheckOut: b.actualCheckOut || null,
        actualCheckOutTime: b.actualCheckOutTime || null,
        paymentStatus: b.paymentStatus || 'Paid',
        paymentMethod: b.paymentMethod || 'Cash',
        status: b.status
      }))
    };
    dateReport.totalRevenue = dateReport.roomRevenue + dateReport.poolRevenue;

    // ── Combined transactions for ledger
    const combinedTransactions = [
      ...allBookings.map(b => ({
        id: b.id,
        type: 'Room Booking',
        item: `Room ${b.roomNumber} (${b.category || 'Deluxe'})`,
        customerName: b.customerName,
        phone: b.phone,
        stayType: b.stayType || 'Family',
        secondGuestName: b.secondGuestName || null,
        secondGuestAge: b.secondGuestAge || null,
        secondGuestAadhaar: b.secondGuestAadhaar || null,
        aadhaarNumber: b.aadhaarNumber || null,
        amount: getBookingRev(b),
        totalAmount: b.totalAmount,
        advancePaid: b.advancePaid,
        remainingBalance: b.remainingBalance || 0,
        paymentMethod: b.paymentMethod || 'Cash',
        paymentStatus: b.paymentStatus || 'Paid',
        checkIn: b.checkIn,
        checkInTime: b.checkInTime || '12:00 PM',
        checkOut: b.checkOut,
        checkOutTime: b.checkOutTime || '11:00 AM',
        actualCheckOut: b.actualCheckOut || null,
        actualCheckOutTime: b.actualCheckOutTime || null,
        timestamp: b.actualCheckOut || b.createdAt || b.checkIn,
        status: b.status
      })),
      ...allPoolBookings.map(p => ({
        id: p.id,
        type: 'Swimming Pool',
        item: `Pool Pass (${p.totalVisitors || p.adultCount} Guests)`,
        customerName: p.customerName || 'Walk-in Swimmer',
        phone: p.phone,
        stayType: 'Pool',
        amount: Number(p.totalAmount),
        totalAmount: Number(p.totalAmount),
        advancePaid: Number(p.totalAmount),
        remainingBalance: 0,
        paymentMethod: p.paymentMethod || 'Cash',
        paymentStatus: p.paymentStatus || 'Paid',
        checkIn: p.date,
        checkInTime: p.entryTime || p.slot || '10:00 AM',
        checkOut: p.date,
        actualCheckOut: null,
        timestamp: p.createdAt || p.date,
        status: p.status || 'Active'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      timeframe,
      summary: {
        totalRoomBookingTillDate: (archive.historicalRoomBookingsCount || 0) + allBookings.length,
        todayRoomBookingCount,
        todayRevenue,
        todayPoolRevenue,
        monthlyRevenue,
        monthlyRoomBookingsCount,
        tillNowRevenue,
        poolRevenue: todayPoolRevenue,
        roomRevenue: todayRoomRevenue,
        totalEntries: allBookings.length + allPoolBookings.length,
        roomBookingsCount: allBookings.length,
        poolPassesCount: allPoolBookings.length
      },
      dateReport,
      recentTransactions: combinedTransactions.slice(0, 100)
    };
  },

  // ───────────────────────────────────────────────────────────────────────────
  // AUTH / ADMIN USERS (Still using local JSON for auth — simple approach)
  // ───────────────────────────────────────────────────────────────────────────
  getAdmins: () => {
    try {
      const fs = require('fs'), path = require('path');
      const dbFile = path.join(__dirname, 'data.json');
      if (!fs.existsSync(dbFile)) return [];
      const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
      return data.admins || [];
    } catch (e) { return []; }
  },

  getAdminByUsername: (username) => {
    return db.getAdmins().find(a => a.username === username);
  },

  createAdmin: async (adminData) => {
    const fs = require('fs'), path = require('path');
    const dbFile = path.join(__dirname, 'data.json');
    let data = {};
    try { data = JSON.parse(fs.readFileSync(dbFile, 'utf-8')); } catch (e) { data = { admins: [] }; }
    if (!data.admins) data.admins = [];
    data.admins.push({ ...adminData, createdAt: new Date().toISOString() });
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
    return adminData;
  },

  // Legacy stubs (not used but kept for compatibility)
  createBanquetBooking: async (d) => ({ id: 'SR-BQ-STUB', ...d }),
  getBanquetBookings: async () => [],
  createLawnBooking: async (d) => ({ id: 'SR-LW-STUB', ...d }),
  getLawnBookings: async () => [],
  getPackages: async () => [],
  getPackageById: async () => null,
  updatePackage: async () => null,
  createPackageBooking: async (d) => ({ id: 'SR-PK-STUB', ...d }),
  getPackageBookings: async () => [],
  createInquiry: async (d) => ({ id: 'INQ-STUB', ...d }),
  getInquiries: async () => [],
  getReviews: async () => [],
  recycleOldDataPolicy: async () => {},
  getData: async () => ({})
};

module.exports = db;
