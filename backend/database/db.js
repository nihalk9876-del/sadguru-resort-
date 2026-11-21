const fs = require('fs');
const path = require('path');
const { DB_FILE, BOOKING_STATUS, ROOM_STATUS } = require('../config/constants');

// Mutex queue implementation to prevent race conditions during concurrent bookings
class AsyncLock {
  constructor() {
    this.queue = Promise.resolve();
  }

  acquire(fn) {
    const next = this.queue.then(async () => {
      try {
        return await fn();
      } catch (err) {
        throw err;
      }
    });
    this.queue = next.catch(() => {});
    return next;
  }
}

const dbLock = new AsyncLock();

// Initial database schema
const defaultData = {
  admins: [],
  rooms: [],
  bookings: [],
  poolBookings: [],
  banquetBookings: [],
  lawnBookings: [],
  packages: [],
  packageBookings: [],
  inquiries: [],
  reviews: [],
  settings: {
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
  }
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDbDirect(defaultData);
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, restoring backup/default:', err);
    return defaultData;
  }
}

function writeDbDirect(data) {
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

// Thread-safe update helper
async function updateDb(mutator) {
  return dbLock.acquire(async () => {
    const data = readDb();
    const result = await mutator(data);
    writeDbDirect(data);
    return result;
  });
}

// Asynchronous MongoDB Atlas sync helper
let mongoModels = null;
function getMongoModels() {
  if (!mongoModels) {
    try {
      mongoModels = require('./mongodb');
    } catch (e) {}
  }
  return mongoModels;
}

function syncToMongo(modelName, query, doc) {
  try {
    const mm = getMongoModels();
    if (mm && mm.getIsConnected() && mm[modelName]) {
      mm[modelName].findOneAndUpdate(query, doc, { upsert: true, new: true }).catch(err => {
        console.warn(`[Mongo Sync Error] ${modelName}:`, err.message);
      });
    }
  } catch (err) {
    console.warn(`[Mongo Sync Warning] ${modelName}:`, err.message);
  }
}

// Date normalization helper (YYYY-MM-DD)
function normalizeDateStr(d) {
  if (!d) return '';
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return String(d).split('T')[0];
  return dateObj.toISOString().split('T')[0];
}

// Core Date Overlap Logic:
// [startA, endA) overlaps with [startB, endB) <=> (startA < endB) && (endA > startB)
function isDateOverlap(startA, endA, startB, endB) {
  const sA = new Date(normalizeDateStr(startA) + 'T00:00:00Z').getTime();
  const eA = new Date(normalizeDateStr(endA) + 'T00:00:00Z').getTime();
  const sB = new Date(normalizeDateStr(startB) + 'T00:00:00Z').getTime();
  const eB = new Date(normalizeDateStr(endB) + 'T00:00:00Z').getTime();

  return sA < eB && eA > sB;
}

function normalizeCategory(cat) {
  if (!cat) return null;
  const lower = cat.toLowerCase();
  if (lower.includes('family') || lower.includes('double')) return 'Deluxe Family';
  return 'Deluxe AC';
}

// Calculate number of nights between check-in and check-out
function calculateNights(checkIn, checkOut) {
  const s = new Date(normalizeDateStr(checkIn) + 'T00:00:00Z').getTime();
  const e = new Date(normalizeDateStr(checkOut) + 'T00:00:00Z').getTime();
  const diffTime = Math.max(0, e - s);
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

const db = {
  // Direct synchronized reader
  getData: () => readDb(),

  // Mutex lock executor for transactions
  transaction: async (callback) => {
    return dbLock.acquire(async () => {
      const data = readDb();
      const result = await callback(data);
      writeDbDirect(data);
      return result;
    });
  },

  // -------------------------------------------------------------
  // ROOM METHODS
  // -------------------------------------------------------------
  getRooms: () => {
    const data = readDb();
    const rooms = data.rooms || [];
    const bookings = data.bookings || [];
    const todayStr = new Date().toISOString().split('T')[0];

    return rooms.map(room => {
      if (room.status === ROOM_STATUS.MAINTENANCE) {
        return { ...room, isOccupied: false };
      }

      // Check if room has an active checked-in or overlapping reservation
      const activeBooking = bookings.find(b => {
        if (String(b.roomId) !== String(room.id) && String(b.roomNumber) !== String(room.roomNumber)) return false;
        if (b.status === BOOKING_STATUS.CANCELLED || b.status === 'Completed' || b.status === 'Checked-Out') return false;
        if (b.status === 'Checked-In') return true;
        const checkInDate = normalizeDateStr(b.checkIn);
        const checkOutDate = normalizeDateStr(b.checkOut);
        return todayStr >= checkInDate && todayStr <= checkOutDate;
      });

      const isOccupied = !!activeBooking;
      return {
        ...room,
        isOccupied,
        status: isOccupied ? 'Occupied' : 'Available',
        occupant: isOccupied ? {
          bookingId: activeBooking.id,
          customerName: activeBooking.customerName,
          phone: activeBooking.phone,
          aadhaarNumber: activeBooking.aadhaarNumber || null,
          age: activeBooking.age || null,
          checkIn: activeBooking.checkIn,
          checkInTime: activeBooking.checkInTime || '12:00 PM',
          checkOut: activeBooking.checkOut,
          checkOutTime: activeBooking.checkOutTime || '11:00 AM',
          occupiedUntil: `${activeBooking.checkOut} ${activeBooking.checkOutTime || '11:00 AM'}`,
          totalAmount: activeBooking.totalAmount,
          advancePaid: activeBooking.advancePaid,
          paymentMethod: activeBooking.paymentMethod || 'Cash'
        } : null
      };
    });
  },

  getRoomById: (id) => {
    const data = readDb();
    return data.rooms.find(r => String(r.id) === String(id) || String(r.roomNumber) === String(id));
  },

  updateRoom: async (id, updates) => {
    return updateDb((data) => {
      const idx = data.rooms.findIndex(r => String(r.id) === String(id) || String(r.roomNumber) === String(id));
      if (idx === -1) throw new Error(`Room ${id} not found`);
      data.rooms[idx] = { ...data.rooms[idx], ...updates, updatedAt: new Date().toISOString() };
      return data.rooms[idx];
    });
  },

  // Check if a specific room is available for given date range
  isRoomAvailableForDates: (roomId, checkIn, checkOut, excludeBookingId = null) => {
    const data = readDb();
    const room = data.rooms.find(r => String(r.id) === String(roomId) || String(r.roomNumber) === String(roomId));
    if (!room) return false;
    if (room.status === ROOM_STATUS.MAINTENANCE) return false;

    // Check confirmed or pending bookings
    const activeBookings = (data.bookings || []).filter(b => {
      if (String(b.roomId) !== String(room.id) && String(b.roomNumber) !== String(room.roomNumber)) return false;
      if (b.status === BOOKING_STATUS.CANCELLED) return false;
      if (excludeBookingId && String(b.id) === String(excludeBookingId)) return false;
      return true;
    });

    for (const b of activeBookings) {
      if (isDateOverlap(checkIn, checkOut, b.checkIn, b.checkOut)) {
        return false;
      }
    }
    return true;
  },

  // Get list of available rooms for a date range & optional category
  getAvailableRooms: (checkIn, checkOut, category = null, guests = null) => {
    const data = readDb();
    const normIn = normalizeDateStr(checkIn);
    const normOut = normalizeDateStr(checkOut);
    const normCat = category ? normalizeCategory(category) : null;

    return data.rooms.filter(room => {
      if (room.status === ROOM_STATUS.MAINTENANCE) return false;
      if (normCat && room.category.toLowerCase() !== normCat.toLowerCase()) return false;
      if (guests && Number(guests) > room.capacity) return false;

      // Check date conflicts
      const conflicts = (data.bookings || []).some(b => {
        if (String(b.roomId) !== String(room.id) && String(b.roomNumber) !== String(room.roomNumber)) return false;
        if (b.status === BOOKING_STATUS.CANCELLED) return false;
        return isDateOverlap(normIn, normOut, b.checkIn, b.checkOut);
      });

      return !conflicts;
    });
  },

  // -------------------------------------------------------------
  // ROOM BOOKINGS & ATOMIC CONCURRENCY PROTECTION
  // -------------------------------------------------------------
  createRoomBooking: async (bookingData) => {
    return dbLock.acquire(async () => {
      const data = readDb();
      const normIn = normalizeDateStr(bookingData.checkIn);
      const normOut = normalizeDateStr(bookingData.checkOut);

      if (!normIn || !normOut) {
        throw new Error('Valid check-in and check-out dates are required.');
      }
      if (new Date(normIn).getTime() >= new Date(normOut).getTime()) {
        throw new Error('Check-out date must be after check-in date.');
      }

      let targetRoom = null;

      // If specific room requested
      if (bookingData.roomId || bookingData.roomNumber) {
        const queryId = bookingData.roomId || bookingData.roomNumber;
        targetRoom = data.rooms.find(r => String(r.id) === String(queryId) || String(r.roomNumber) === String(queryId));
        if (!targetRoom) {
          throw new Error(`Requested room ${queryId} was not found.`);
        }
        if (targetRoom.status === ROOM_STATUS.MAINTENANCE) {
          throw new Error(`Room ${targetRoom.roomNumber} is currently closed for maintenance.`);
        }

        // Verify no overlapping active booking
        const hasConflict = (data.bookings || []).some(b => {
          if (String(b.roomId) !== String(targetRoom.id) && String(b.roomNumber) !== String(targetRoom.roomNumber)) return false;
          if (b.status === BOOKING_STATUS.CANCELLED) return false;
          return isDateOverlap(normIn, normOut, b.checkIn, b.checkOut);
        });

        if (hasConflict) {
          throw new Error('Sorry! This room is already booked for the selected time slot. Please select another room.');
        }
      } else {
        // Auto-assign available room matching category randomly
        const requestedCategory = bookingData.category || 'Deluxe AC';
        const normCat = normalizeCategory(requestedCategory);
        
        // Find all rooms in this category (not under maintenance)
        const candidateRooms = data.rooms.filter(r => 
          r.status !== ROOM_STATUS.MAINTENANCE && 
          r.category.toLowerCase() === normCat.toLowerCase()
        );

        // Find all candidates without date overlap conflicts
        const availableCandidates = candidateRooms.filter(candidate => {
          const hasConflict = (data.bookings || []).some(b => {
            if (String(b.roomId) !== String(candidate.id) && String(b.roomNumber) !== String(candidate.roomNumber)) return false;
            if (b.status === BOOKING_STATUS.CANCELLED) return false;
            return isDateOverlap(normIn, normOut, b.checkIn, b.checkOut);
          });
          return !hasConflict;
        });

        if (availableCandidates.length === 0) {
          throw new Error(`All rooms in ${requestedCategory} are fully booked for the selected dates.`);
        }

        // Randomly allot from available candidate rooms
        // (101-107 for AC Deluxe, 201-202 for Family Double Deluxe)
        const randomIndex = Math.floor(Math.random() * availableCandidates.length);
        targetRoom = availableCandidates[randomIndex];
      }

      // Generate unique Booking Reference
      const year = new Date().getFullYear();
      const count = (data.bookings || []).length + 101;
      const bookingId = `SR-RM-${year}-${String(count).padStart(4, '0')}`;

      const nights = calculateNights(normIn, normOut);
      const nightlyRate = Number(bookingData.customPrice || bookingData.price || targetRoom.price);
      const subtotal = nightlyRate * nights;
      const taxAmount = Math.round(subtotal * ((data.settings.taxPercentage || 12) / 100));
      const totalAmount = subtotal + taxAmount;
      const advancePaid = bookingData.advancePaid !== undefined ? Number(bookingData.advancePaid) : totalAmount;
      const remainingBalance = Math.max(0, totalAmount - advancePaid);

      const newBooking = {
        id: bookingId,
        type: 'room',
        roomId: targetRoom.id,
        roomNumber: targetRoom.roomNumber,
        roomName: targetRoom.name,
        category: targetRoom.category,
        customerName: bookingData.customerName,
        phone: bookingData.phone,
        email: bookingData.email,
        address: bookingData.address || '',
        idProofType: bookingData.idProofType || 'Aadhaar / Passport',
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
      };

      data.bookings.unshift(newBooking);
      writeDbDirect(data);
      syncToMongo('Booking', { id: newBooking.id }, newBooking);
      return newBooking;
    });
  },

  getBookings: (filters = {}) => {
    const data = readDb();
    let list = [...(data.bookings || [])];

    if (filters.status) {
      list = list.filter(b => b.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.paymentStatus) {
      list = list.filter(b => b.paymentStatus.toLowerCase() === filters.paymentStatus.toLowerCase());
    }
    if (filters.category) {
      list = list.filter(b => b.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(b => 
        (b.id && b.id.toLowerCase().includes(q)) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (String(b.roomNumber).includes(q))
      );
    }
    if (filters.date) {
      const d = normalizeDateStr(filters.date);
      list = list.filter(b => b.checkIn <= d && b.checkOut >= d);
    }

    return list;
  },

  getBookingById: (id) => {
    const data = readDb();
    return (data.bookings || []).find(b => 
      b.id.toLowerCase() === id.trim().toLowerCase()
    );
  },

  getBookingByIdAndPhone: (id, phone) => {
    const data = readDb();
    const cleanId = id.trim().toLowerCase();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    return (data.bookings || []).find(b => {
      const matchId = b.id.toLowerCase() === cleanId;
      const bPhoneClean = (b.phone || '').replace(/[^0-9]/g, '');
      const matchPhone = bPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(bPhoneClean);
      return matchId && matchPhone;
    });
  },

  updateBookingStatus: async (bookingId, status, paymentStatus = null) => {
    return updateDb((data) => {
      const booking = (data.bookings || []).find(b => b.id.toLowerCase() === bookingId.toLowerCase());
      if (!booking) throw new Error(`Booking ${bookingId} not found`);

      if (status) booking.status = status;
      if (paymentStatus) {
        booking.paymentStatus = paymentStatus;
        if (paymentStatus === 'Paid') {
          booking.advancePaid = booking.totalAmount;
          booking.remainingBalance = 0;
        }
      }
      booking.updatedAt = new Date().toISOString();
      return booking;
    });
  },

  cancelBooking: async (bookingId, cancellationReason = 'Customer requested cancellation') => {
    return updateDb((data) => {
      const booking = (data.bookings || []).find(b => b.id.toLowerCase() === bookingId.toLowerCase());
      if (!booking) throw new Error(`Booking ${bookingId} not found`);

      booking.status = BOOKING_STATUS.CANCELLED;
      booking.cancellationReason = cancellationReason;
      booking.cancelledAt = new Date().toISOString();
      return booking;
    });
  },

  // -------------------------------------------------------------
  // SWIMMING POOL BOOKINGS
  // -------------------------------------------------------------
  createPoolBooking: async (poolData) => {
    return dbLock.acquire(async () => {
      const data = readDb();
      const normDate = normalizeDateStr(poolData.date);
      if (!normDate) throw new Error('Date is required for swimming pool booking.');

      const year = new Date().getFullYear();
      const count = (data.poolBookings || []).length + 101;
      const bookingId = `SR-PL-${year}-${String(count).padStart(4, '0')}`;

      const adultCount = Number(poolData.adultCount || 1);
      const childCount = Number(poolData.childCount || 0);
      const adultRate = data.settings.adultPoolTicket || 350;
      const childRate = data.settings.childPoolTicket || 200;
      const totalAmount = (adultCount * adultRate) + (childCount * childRate);

      const newBooking = {
        id: bookingId,
        type: 'swimming_pool',
        customerName: poolData.customerName,
        phone: poolData.phone,
        email: poolData.email,
        date: normDate,
        timeSlot: poolData.timeSlot || '04:00 PM - 07:00 PM',
        adultCount,
        childCount,
        totalVisitors: adultCount + childCount,
        totalAmount,
        paymentStatus: poolData.paymentStatus || 'Paid',
        paymentMethod: poolData.paymentMethod || 'UPI / Card',
        status: BOOKING_STATUS.CONFIRMED,
        notes: poolData.notes || '',
        createdAt: new Date().toISOString()
      };

      if (!data.poolBookings) data.poolBookings = [];
      data.poolBookings.unshift(newBooking);
      writeDbDirect(data);
      return newBooking;
    });
  },

  getPoolBookings: (filters = {}) => {
    const data = readDb();
    let list = [...(data.poolBookings || [])];
    if (filters.date) {
      const d = normalizeDateStr(filters.date);
      list = list.filter(b => b.date === d);
    }
    if (filters.status) {
      list = list.filter(b => b.status.toLowerCase() === filters.status.toLowerCase());
    }
    return list;
  },

  // -------------------------------------------------------------
  // BANQUET HALL BOOKINGS & CONFLICT PREVENTION
  // -------------------------------------------------------------
  createBanquetBooking: async (banquetData) => {
    return dbLock.acquire(async () => {
      const data = readDb();
      const normDate = normalizeDateStr(banquetData.date);
      const slot = banquetData.timeSlot || 'Full Day';

      if (!normDate) throw new Error('Event date is required.');

      // Check slot conflict
      if (slot === 'Full Day') {
        const conflict = (data.banquetBookings || []).some(b => 
          b.date === normDate && b.status === BOOKING_STATUS.CONFIRMED
        );
        if (conflict) {
          throw new Error(`Banquet Hall is already reserved on ${normDate}.`);
        }
      } else {
        const conflict = (data.banquetBookings || []).some(b => 
          b.date === normDate && 
          b.status === BOOKING_STATUS.CONFIRMED && 
          (b.timeSlot === 'Full Day' || b.timeSlot === slot)
        );
        if (conflict) {
          throw new Error(`Banquet Hall is already reserved on ${normDate} for ${slot}.`);
        }
      }

      const year = new Date().getFullYear();
      const count = (data.banquetBookings || []).length + 101;
      const bookingId = `SR-BQ-${year}-${String(count).padStart(4, '0')}`;

      const newBooking = {
        id: bookingId,
        type: 'banquet',
        customerName: banquetData.customerName,
        phone: banquetData.phone,
        email: banquetData.email,
        date: normDate,
        timeSlot: slot,
        eventType: banquetData.eventType || 'Wedding Function',
        guestCount: Number(banquetData.guestCount || 100),
        requirements: banquetData.requirements || 'Catering & Audio Setup',
        estimatedAmount: Number(banquetData.estimatedAmount || 45000),
        advancePaid: Number(banquetData.advancePaid || 15000),
        status: banquetData.status || BOOKING_STATUS.CONFIRMED,
        paymentStatus: banquetData.advancePaid > 0 ? 'Partial Advance' : 'Pending',
        createdAt: new Date().toISOString()
      };

      if (!data.banquetBookings) data.banquetBookings = [];
      data.banquetBookings.unshift(newBooking);
      writeDbDirect(data);
      return newBooking;
    });
  },

  getBanquetBookings: (filters = {}) => {
    const data = readDb();
    let list = [...(data.banquetBookings || [])];
    if (filters.date) {
      list = list.filter(b => b.date === normalizeDateStr(filters.date));
    }
    if (filters.status) {
      list = list.filter(b => b.status.toLowerCase() === filters.status.toLowerCase());
    }
    return list;
  },

  // -------------------------------------------------------------
  // GREEN LAWN BOOKINGS & CONFLICT PREVENTION
  // -------------------------------------------------------------
  createLawnBooking: async (lawnData) => {
    return dbLock.acquire(async () => {
      const data = readDb();
      const normDate = normalizeDateStr(lawnData.date);
      if (!normDate) throw new Error('Event date is required.');

      const conflict = (data.lawnBookings || []).some(b => 
        b.date === normDate && b.status === BOOKING_STATUS.CONFIRMED
      );
      if (conflict) {
        throw new Error(`The Lush Green Lawn is already booked for an event on ${normDate}.`);
      }

      const year = new Date().getFullYear();
      const count = (data.lawnBookings || []).length + 101;
      const bookingId = `SR-LW-${year}-${String(count).padStart(4, '0')}`;

      const newBooking = {
        id: bookingId,
        type: 'lawn',
        customerName: lawnData.customerName,
        phone: lawnData.phone,
        email: lawnData.email,
        date: normDate,
        eventType: lawnData.eventType || 'Grand Wedding Reception',
        guestCount: Number(lawnData.guestCount || 250),
        requirements: lawnData.requirements || 'Stage, Mandap & Lighting',
        estimatedAmount: Number(lawnData.estimatedAmount || 65000),
        advancePaid: Number(lawnData.advancePaid || 20000),
        status: lawnData.status || BOOKING_STATUS.CONFIRMED,
        paymentStatus: lawnData.advancePaid > 0 ? 'Partial Advance' : 'Pending',
        createdAt: new Date().toISOString()
      };

      if (!data.lawnBookings) data.lawnBookings = [];
      data.lawnBookings.unshift(newBooking);
      writeDbDirect(data);
      return newBooking;
    });
  },

  getLawnBookings: (filters = {}) => {
    const data = readDb();
    let list = [...(data.lawnBookings || [])];
    if (filters.date) {
      list = list.filter(b => b.date === normalizeDateStr(filters.date));
    }
    if (filters.status) {
      list = list.filter(b => b.status.toLowerCase() === filters.status.toLowerCase());
    }
    return list;
  },

  // -------------------------------------------------------------
  // PACKAGES
  // -------------------------------------------------------------
  getPackages: () => {
    const data = readDb();
    return data.packages || [];
  },

  getPackageById: (id) => {
    const data = readDb();
    return (data.packages || []).find(p => String(p.id) === String(id));
  },

  updatePackage: async (id, updates) => {
    return updateDb((data) => {
      const idx = (data.packages || []).findIndex(p => String(p.id) === String(id));
      if (idx === -1) throw new Error(`Package ${id} not found`);
      data.packages[idx] = { ...data.packages[idx], ...updates, updatedAt: new Date().toISOString() };
      return data.packages[idx];
    });
  },

  createPackageBooking: async (pkgBookingData) => {
    return dbLock.acquire(async () => {
      const data = readDb();
      const year = new Date().getFullYear();
      const count = (data.packageBookings || []).length + 101;
      const bookingId = `SR-PK-${year}-${String(count).padStart(4, '0')}`;

      const newBooking = {
        id: bookingId,
        type: 'package',
        packageId: pkgBookingData.packageId,
        packageName: pkgBookingData.packageName,
        customerName: pkgBookingData.customerName,
        phone: pkgBookingData.phone,
        email: pkgBookingData.email,
        preferredDate: normalizeDateStr(pkgBookingData.preferredDate),
        guests: Number(pkgBookingData.guests || 2),
        totalAmount: Number(pkgBookingData.totalAmount || 0),
        status: BOOKING_STATUS.CONFIRMED,
        paymentStatus: 'Paid',
        notes: pkgBookingData.notes || '',
        createdAt: new Date().toISOString()
      };

      if (!data.packageBookings) data.packageBookings = [];
      data.packageBookings.unshift(newBooking);
      writeDbDirect(data);
      return newBooking;
    });
  },

  getPackageBookings: () => {
    const data = readDb();
    return data.packageBookings || [];
  },

  // -------------------------------------------------------------
  // CONTACT INQUIRIES & REVIEWS
  // -------------------------------------------------------------
  createInquiry: async (inquiryData) => {
    return updateDb((data) => {
      const count = (data.inquiries || []).length + 1;
      const newInquiry = {
        id: `INQ-${String(count).padStart(4, '0')}`,
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone,
        subject: inquiryData.subject || 'General Inquiry',
        message: inquiryData.message,
        status: 'Unread',
        createdAt: new Date().toISOString()
      };
      if (!data.inquiries) data.inquiries = [];
      data.inquiries.unshift(newInquiry);
      return newInquiry;
    });
  },

  getInquiries: () => {
    const data = readDb();
    return data.inquiries || [];
  },

  getReviews: () => {
    const data = readDb();
    return data.reviews || [];
  },

  // -------------------------------------------------------------
  // SETTINGS
  // -------------------------------------------------------------
  getSettings: () => {
    const data = readDb();
    return data.settings || {};
  },

  updateSettings: async (updates) => {
    return updateDb((data) => {
      data.settings = { ...data.settings, ...updates, updatedAt: new Date().toISOString() };
      return data.settings;
    });
  },

  // -------------------------------------------------------------
  // ADMIN STATS & ANALYTICS
  // -------------------------------------------------------------
  getAdminStats: () => {
    const data = readDb();
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

    const allBookings = data.bookings || [];
    const poolBookings = data.poolBookings || [];
    const banquetBookings = data.banquetBookings || [];
    const lawnBookings = data.lawnBookings || [];
    const packageBookings = data.packageBookings || [];

    const totalRooms = (data.rooms || []).length;
    const maintenanceRooms = (data.rooms || []).filter(r => r.status === ROOM_STATUS.MAINTENANCE).length;

    // Room occupancy today
    const occupiedRoomNumbers = new Set();
    allBookings.forEach(b => {
      if (b.status !== BOOKING_STATUS.CANCELLED && b.checkIn <= todayStr && b.checkOut > todayStr) {
        occupiedRoomNumbers.add(b.roomNumber);
      }
    });

    const occupiedCount = occupiedRoomNumbers.size;
    const availableCount = Math.max(0, totalRooms - occupiedCount - maintenanceRooms);

    // Bookings classification
    const todayBookings = allBookings.filter(b => b.checkIn === todayStr);
    const tomorrowBookings = allBookings.filter(b => b.checkIn === tomorrowStr);
    const upcomingBookings = allBookings.filter(b => b.checkIn > todayStr && b.status !== BOOKING_STATUS.CANCELLED);
    const completedBookings = allBookings.filter(b => b.checkOut <= todayStr && b.status !== BOOKING_STATUS.CANCELLED);
    const cancelledBookings = allBookings.filter(b => b.status === BOOKING_STATUS.CANCELLED);

    // Revenue calculations (Room + Pool + Banquet + Lawn + Packages)
    let totalRevenue = 0;
    let pendingPayments = 0;

    allBookings.forEach(b => {
      if (b.status !== BOOKING_STATUS.CANCELLED) {
        totalRevenue += Number(b.advancePaid || b.totalAmount || 0);
        pendingPayments += Number(b.remainingBalance || 0);
      }
    });

    poolBookings.forEach(p => {
      if (p.status !== BOOKING_STATUS.CANCELLED) {
        totalRevenue += Number(p.totalAmount || 0);
      }
    });

    banquetBookings.forEach(bq => {
      if (bq.status !== BOOKING_STATUS.CANCELLED) {
        totalRevenue += Number(bq.advancePaid || bq.estimatedAmount || 0);
      }
    });

    lawnBookings.forEach(lw => {
      if (lw.status !== BOOKING_STATUS.CANCELLED) {
        totalRevenue += Number(lw.advancePaid || lw.estimatedAmount || 0);
      }
    });

    packageBookings.forEach(pkg => {
      if (pkg.status !== BOOKING_STATUS.CANCELLED) {
        totalRevenue += Number(pkg.totalAmount || 0);
      }
    });

    // Day-wise last 7 days revenue & bookings
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      let dayRev = 0;
      let dayBookingsCount = 0;

      allBookings.forEach(b => {
        const bookedOn = (b.createdAt || b.checkIn).split('T')[0];
        if (bookedOn === dateStr && b.status !== BOOKING_STATUS.CANCELLED) {
          dayRev += Number(b.advancePaid || b.totalAmount || 0);
          dayBookingsCount++;
        }
      });

      dailyStats.push({
        date: dateStr,
        day: dayName,
        revenue: dayRev,
        bookings: dayBookingsCount
      });
    }

    // Monthly stats for current year
    const monthlyStats = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    for (let m = 0; m < 12; m++) {
      let monthRev = 0;
      let count = 0;
      allBookings.forEach(b => {
        const bDate = new Date(b.createdAt || b.checkIn);
        if (bDate.getFullYear() === currentYear && bDate.getMonth() === m && b.status !== BOOKING_STATUS.CANCELLED) {
          monthRev += Number(b.advancePaid || b.totalAmount || 0);
          count++;
        }
      });
      monthlyStats.push({
        month: months[m],
        revenue: monthRev,
        bookings: count
      });
    }

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
        poolBookingsCount: poolBookings.length,
        banquetBookingsCount: banquetBookings.length,
        lawnBookingsCount: lawnBookings.length,
        packageBookingsCount: packageBookings.length
      },
      todayBookings,
      tomorrowBookings,
      dailyStats,
      monthlyStats
    };
  },

  // -------------------------------------------------------------
  // ADMIN APP: REAL-TIME ROOM OCCUPANCY MATRIX (FLOOR PLAN)
  // -------------------------------------------------------------
  getRoomMatrix: () => {
    const data = readDb();
    const rooms = data.rooms || [];
    const allBookings = data.bookings || [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return rooms.map(room => {
      // Find currently active occupant in this room
      const activeBooking = allBookings.find(b => {
        if (String(b.roomId) !== String(room.id) && String(b.roomNumber) !== String(room.roomNumber)) return false;
        if (b.status === BOOKING_STATUS.CANCELLED || b.status === 'Completed' || b.status === 'Checked-Out') return false;

        // If explicitly checked in or within date range
        if (b.status === 'Checked-In') return true;

        const checkInDate = normalizeDateStr(b.checkIn);
        const checkOutDate = normalizeDateStr(b.checkOut);
        return todayStr >= checkInDate && todayStr <= checkOutDate;
      });

      // Find upcoming booking for today or tomorrow
      const upcomingBooking = allBookings.find(b => {
        if (String(b.roomId) !== String(room.id) && String(b.roomNumber) !== String(room.roomNumber)) return false;
        if (b.status === BOOKING_STATUS.CANCELLED || b.status === 'Completed') return false;
        if (activeBooking && b.id === activeBooking.id) return false;
        const checkInDate = normalizeDateStr(b.checkIn);
        return checkInDate >= todayStr;
      });

      // Determine 5-state room lifecycle: Available, Reserved, Occupied, Cleaning, Under Maintenance
      let calculatedStatus = ROOM_STATUS.AVAILABLE;
      if (room.status === ROOM_STATUS.MAINTENANCE || room.status === 'Under Maintenance') {
        calculatedStatus = ROOM_STATUS.MAINTENANCE;
      } else if (room.status === ROOM_STATUS.CLEANING || room.status === 'Cleaning') {
        calculatedStatus = ROOM_STATUS.CLEANING;
      } else if (activeBooking) {
        if (activeBooking.status === 'Checked-In') {
          calculatedStatus = ROOM_STATUS.OCCUPIED;
        } else if (activeBooking.status === BOOKING_STATUS.CONFIRMED) {
          calculatedStatus = ROOM_STATUS.RESERVED;
        } else {
          calculatedStatus = ROOM_STATUS.OCCUPIED;
        }
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

  // -------------------------------------------------------------
  // ADMIN APP: ON-SPOT ROOM ALLOTMENT WITH AADHAAR & CUSTOM RATE
  // -------------------------------------------------------------
  createOnSpotRoomBooking: async (bookingData) => {
    return dbLock.acquire(async () => {
      const data = readDb();
      const {
        roomNumber,
        customerName,
        phone,
        aadhaarNumber,
        dob,
        age,
        guests = 2,
        adults = 2,
        children = 0,
        checkInDate,
        checkInTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        checkOutDate,
        checkOutTime = '11:00 AM',
        durationHours = 24,
        rate,
        advancePaid,
        paymentMethod = 'Cash',
        notes = ''
      } = bookingData;

      if (!roomNumber) throw new Error('Room number selection is required (101-107, 201-202).');
      if (!customerName || !customerName.trim()) throw new Error('Guest Name is required (from Aadhaar scan or manual entry).');
      if (!phone || !phone.trim()) throw new Error('Guest Contact Phone Number is required.');

      // Find selected room
      const targetRoom = data.rooms.find(r => String(r.roomNumber) === String(roomNumber) || String(r.id) === String(roomNumber));
      if (!targetRoom) throw new Error(`Room ${roomNumber} not found.`);
      if (targetRoom.status === ROOM_STATUS.MAINTENANCE) {
        throw new Error(`Room ${roomNumber} is currently under maintenance.`);
      }

      const normIn = normalizeDateStr(checkInDate || new Date().toISOString().split('T')[0]);
      let normOut = checkOutDate ? normalizeDateStr(checkOutDate) : null;
      if (!normOut) {
        const nextDay = new Date(normIn);
        nextDay.setDate(nextDay.getDate() + 1);
        normOut = nextDay.toISOString().split('T')[0];
      }

      // Check conflict with active bookings
      const hasConflict = (data.bookings || []).some(b => {
        if (String(b.roomId) !== String(targetRoom.id) && String(b.roomNumber) !== String(targetRoom.roomNumber)) return false;
        if (b.status === BOOKING_STATUS.CANCELLED || b.status === 'Completed' || b.status === 'Checked-Out') return false;
        return isDateOverlap(normIn, normOut, b.checkIn, b.checkOut);
      });

      if (hasConflict) {
        throw new Error('Sorry! This room is already booked for the selected time slot. Please select another room.');
      }

      const nights = calculateNights(normIn, normOut);
      const nightlyRate = Number(rate !== undefined && rate !== '' ? rate : targetRoom.price);
      const totalAmount = nightlyRate * nights;
      const paid = advancePaid !== undefined && advancePaid !== '' ? Number(advancePaid) : totalAmount;
      const remainingBalance = Math.max(0, totalAmount - paid);

      const year = new Date().getFullYear();
      const count = (data.bookings || []).length + 101;
      const bookingId = `SR-SPOT-${year}-${String(count).padStart(4, '0')}`;

      const newBooking = {
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
        guests: Number(guests),
        adults: Number(adults),
        children: Number(children),
        checkIn: normIn,
        checkInTime,
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
        status: 'Checked-In', // Immediately checked-in on spot
        specialRequests: notes,
        allottedBy: 'Admin (App)',
        createdAt: new Date().toISOString()
      };

      if (!data.bookings) data.bookings = [];
      data.bookings.unshift(newBooking);
      writeDbDirect(data);
      syncToMongo('Booking', { id: newBooking.id }, newBooking);
      return newBooking;
    });
  },

  // -------------------------------------------------------------
  // ADMIN APP: EARLY CHECKOUT & HOUSEKEEPING WORKFLOW
  // -------------------------------------------------------------
  earlyCheckoutRoomBooking: async (roomNumberOrId, actualCheckOutTime) => {
    return updateDb((data) => {
      const now = new Date();

      // Find active booking for this room
      const booking = (data.bookings || []).find(b => {
        const matchesRoom = String(b.roomNumber) === String(roomNumberOrId) || String(b.roomId) === String(roomNumberOrId) || String(b.id) === String(roomNumberOrId);
        if (!matchesRoom) return false;
        return b.status === 'Checked-In' || b.status === BOOKING_STATUS.CONFIRMED;
      });

      if (!booking) {
        throw new Error(`No active checked-in booking found for Room ${roomNumberOrId}.`);
      }

      const scheduledCheckOut = booking.checkOut;
      const scheduledCheckOutTime = booking.checkOutTime;

      booking.status = 'Checked-Out';
      booking.actualCheckOut = now.toISOString().split('T')[0];
      booking.actualCheckOutTime = actualCheckOutTime || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      booking.originalExpectedCheckOut = `${scheduledCheckOut} ${scheduledCheckOutTime || '11:00 AM'}`;
      booking.isEarlyCheckout = true;
      booking.updatedAt = now.toISOString();

      // Immediately transition room status to CLEANING
      const targetRoom = data.rooms.find(r => String(r.roomNumber) === String(booking.roomNumber) || String(r.id) === String(booking.roomId));
      if (targetRoom) {
        targetRoom.status = ROOM_STATUS.CLEANING;
        targetRoom.updatedAt = now.toISOString();
        syncToMongo('Room', { roomNumber: targetRoom.roomNumber }, targetRoom);
      }

      syncToMongo('Booking', { id: booking.id }, booking);
      return { booking, room: targetRoom };
    });
  },

  // Complete Housekeeping Cleaning -> Moves room to AVAILABLE
  completeCleaning: async (roomNumberOrId) => {
    return updateDb((data) => {
      const targetRoom = data.rooms.find(r => String(r.roomNumber) === String(roomNumberOrId) || String(r.id) === String(roomNumberOrId));
      if (!targetRoom) {
        throw new Error(`Room ${roomNumberOrId} not found.`);
      }

      targetRoom.status = ROOM_STATUS.AVAILABLE;
      targetRoom.updatedAt = new Date().toISOString();
      syncToMongo('Room', { roomNumber: targetRoom.roomNumber }, targetRoom);

      return targetRoom;
    });
  },

  // Manual 5-State Room Status Update
  updateRoomStatus: async (roomNumberOrId, newStatus) => {
    return updateDb((data) => {
      const targetRoom = data.rooms.find(r => String(r.roomNumber) === String(roomNumberOrId) || String(r.id) === String(roomNumberOrId));
      if (!targetRoom) {
        throw new Error(`Room ${roomNumberOrId} not found.`);
      }

      targetRoom.status = newStatus;
      targetRoom.updatedAt = new Date().toISOString();
      syncToMongo('Room', { roomNumber: targetRoom.roomNumber }, targetRoom);

      return targetRoom;
    });
  },

  // Payment Sub-ledger: Record payment & recalculate balance
  addBookingPayment: async (bookingId, paymentData) => {
    return updateDb((data) => {
      const booking = (data.bookings || []).find(b => b.id.toLowerCase() === bookingId.toLowerCase());
      if (!booking) {
        throw new Error(`Booking ${bookingId} not found.`);
      }

      const pAmount = Number(paymentData.amount) || 0;
      if (pAmount <= 0) throw new Error('Payment amount must be greater than 0.');

      if (!booking.payments) booking.payments = [];
      booking.payments.push({
        id: `PAY-${Date.now()}`,
        amount: pAmount,
        method: paymentData.paymentMethod || 'Cash',
        date: new Date().toISOString(),
        notes: paymentData.notes || ''
      });

      booking.advancePaid = (Number(booking.advancePaid) || 0) + pAmount;
      booking.remainingBalance = Math.max(0, Number(booking.totalAmount) - booking.advancePaid);
      booking.paymentStatus = booking.remainingBalance === 0 ? 'Paid' : 'Partial Advance';
      booking.updatedAt = new Date().toISOString();

      return booking;
    });
  },

  // Backward compatibility wrapper
  checkoutRoomBooking: async (roomNumberOrId) => {
    const res = await db.earlyCheckoutRoomBooking(roomNumberOrId);
    return res.booking;
  },

  // -------------------------------------------------------------
  // ADMIN APP: SWIMMING POOL PASS ALLOTMENT (NO AADHAAR NEEDED)
  // -------------------------------------------------------------
  createPoolPass: async (passData) => {
    return dbLock.acquire(async () => {
      const data = readDb();
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

      if (!phone || !phone.trim()) {
        throw new Error('Guest mobile number is required for swimming pool allotment.');
      }

      const year = new Date().getFullYear();
      const count = (data.poolBookings || []).length + 101;
      const passId = `SR-PL-PASS-${year}-${String(count).padStart(4, '0')}`;

      const adultRate = data.settings.adultPoolTicket || 350;
      const childRate = data.settings.childPoolTicket || 200;
      const defaultTotal = (Number(adultCount) * adultRate) + (Number(childCount) * childRate);
      const totalAmount = customRate !== undefined && customRate !== '' ? Number(customRate) : defaultTotal;

      const now = new Date();
      const entryTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const validUntilDate = new Date(now.getTime() + (Number(durationHours) || 2) * 60 * 60 * 1000);
      const validUntil = validUntilDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const newPass = {
        id: passId,
        type: 'swimming_pool',
        bookingSource: 'pool_walkin_app',
        customerName: customerName ? customerName.trim() : 'Guest Swimmer',
        phone: phone.trim(),
        date: now.toISOString().split('T')[0],
        entryTime,
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
      };

      if (!data.poolBookings) data.poolBookings = [];
      data.poolBookings.unshift(newPass);
      writeDbDirect(data);
      return newPass;
    });
  },

  // -------------------------------------------------------------
  // ADMIN APP: WEEKLY & MONTHLY COMPREHENSIVE REPORTS & METRICS
  // -------------------------------------------------------------
  getAdminReports: (timeframe = 'month') => {
    const data = readDb();
    const allBookings = data.bookings || [];
    const poolBookings = data.poolBookings || [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Determine cutoff date based on timeframe
    let daysToLookBack = 30;
    if (timeframe === 'today') daysToLookBack = 1;
    else if (timeframe === 'week') daysToLookBack = 7;
    else if (timeframe === 'month') daysToLookBack = 30;
    else if (timeframe === 'year') daysToLookBack = 365;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (daysToLookBack - 1));
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // Filter relevant room bookings
    const filteredRoomBookings = allBookings.filter(b => {
      const bDate = (b.createdAt || b.checkIn || '').split('T')[0];
      return bDate >= cutoffStr && b.status !== BOOKING_STATUS.CANCELLED;
    });

    // Filter relevant pool passes
    const filteredPoolBookings = poolBookings.filter(p => {
      const pDate = (p.createdAt || p.date || '').split('T')[0];
      return pDate >= cutoffStr && p.status !== BOOKING_STATUS.CANCELLED;
    });

    // Revenue calculations
    let roomRevenue = 0;
    let poolRevenue = 0;
    let cashRevenue = 0;
    let upiRevenue = 0;
    let cardRevenue = 0;

    filteredRoomBookings.forEach(b => {
      const rev = Number(b.advancePaid !== undefined ? b.advancePaid : b.totalAmount) || 0;
      roomRevenue += rev;
      const method = (b.paymentMethod || 'Cash').toLowerCase();
      if (method.includes('upi') || method.includes('gpay') || method.includes('phonepe')) upiRevenue += rev;
      else if (method.includes('card')) cardRevenue += rev;
      else cashRevenue += rev;
    });

    filteredPoolBookings.forEach(p => {
      const rev = Number(p.totalAmount) || 0;
      poolRevenue += rev;
      const method = (p.paymentMethod || 'Cash').toLowerCase();
      if (method.includes('upi') || method.includes('gpay') || method.includes('phonepe')) upiRevenue += rev;
      else if (method.includes('card')) cardRevenue += rev;
      else cashRevenue += rev;
    });

    const totalRevenue = roomRevenue + poolRevenue;
    const totalEntries = filteredRoomBookings.length + filteredPoolBookings.length;

    // Daily breakdown for visual graphs / tables
    const dailyBreakdown = [];
    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      let dayRoomRev = 0;
      let dayPoolRev = 0;
      let dayEntries = 0;

      filteredRoomBookings.forEach(b => {
        const bDate = (b.createdAt || b.checkIn || '').split('T')[0];
        if (bDate === dStr) {
          dayRoomRev += Number(b.advancePaid !== undefined ? b.advancePaid : b.totalAmount) || 0;
          dayEntries++;
        }
      });

      filteredPoolBookings.forEach(p => {
        const pDate = (p.createdAt || p.date || '').split('T')[0];
        if (pDate === dStr) {
          dayPoolRev += Number(p.totalAmount) || 0;
          dayEntries++;
        }
      });

      dailyBreakdown.push({
        date: dStr,
        label: dayLabel,
        roomRevenue: dayRoomRev,
        poolRevenue: dayPoolRev,
        totalRevenue: dayRoomRev + dayPoolRev,
        entriesCount: dayEntries
      });
    }

    // Combined recent transactions
    const combinedTransactions = [
      ...filteredRoomBookings.map(b => ({
        id: b.id,
        type: 'Room Booking',
        item: `Room ${b.roomNumber} (${b.category || 'Deluxe'})`,
        customerName: b.customerName,
        phone: b.phone,
        aadhaarNumber: b.aadhaarNumber || null,
        amount: Number(b.totalAmount || b.nightlyRate),
        paymentMethod: b.paymentMethod || 'Cash',
        paymentStatus: b.paymentStatus || 'Paid',
        timestamp: b.createdAt || b.checkIn,
        status: b.status,
        source: b.bookingSource || 'online'
      })),
      ...filteredPoolBookings.map(p => ({
        id: p.id,
        type: 'Swimming Pool',
        item: `Pool Pass (${p.totalVisitors || p.adultCount} Guests, ${p.durationHours || 2}h)`,
        customerName: p.customerName || 'Walk-in Swimmer',
        phone: p.phone,
        aadhaarNumber: null,
        amount: Number(p.totalAmount),
        paymentMethod: p.paymentMethod || 'Cash',
        paymentStatus: p.paymentStatus || 'Paid',
        timestamp: p.createdAt || p.date,
        status: p.status || 'Active',
        source: 'pool_walkin'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      timeframe,
      summary: {
        totalRevenue,
        roomRevenue,
        poolRevenue,
        totalEntries,
        roomBookingsCount: filteredRoomBookings.length,
        poolPassesCount: filteredPoolBookings.length,
        cashRevenue,
        upiRevenue,
        cardRevenue
      },
      dailyBreakdown,
      recentTransactions: combinedTransactions.slice(0, 50)
    };
  }
};

module.exports = db;
