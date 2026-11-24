const path = require('path');
const fs = require('fs');
let admin = null;

try {
  admin = require('firebase-admin');
} catch (err) {
  console.warn('[FCM] firebase-admin package not loaded:', err.message);
}

const { AdminDeviceToken, NotificationLog } = require('../database/mongodb');

// Deduplication cache (in-memory sliding window)
const recentEvents = new Map();
function isDuplicateEvent(eventKey) {
  if (!eventKey) return false;
  const now = Date.now();
  if (recentEvents.has(eventKey)) {
    const timestamp = recentEvents.get(eventKey);
    if (now - timestamp < 60000) { // 60s duplicate threshold
      return true;
    }
  }
  recentEvents.set(eventKey, now);
  // Housekeeping cleanup
  if (recentEvents.size > 200) {
    for (const [k, ts] of recentEvents.entries()) {
      if (now - ts > 300000) recentEvents.delete(k);
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIREBASE ADMIN INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────
let firebaseInitialized = false;

function initFirebase() {
  if (!admin) return false;
  if (admin.apps && admin.apps.length > 0) {
    firebaseInitialized = true;
    return true;
  }

  try {
    // 1. Check raw JSON or base64 environment variable
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_CONFIG_JSON;
    if (serviceAccountEnv) {
      let creds;
      try {
        creds = JSON.parse(serviceAccountEnv);
      } catch (jsonErr) {
        // Try base64 decoding
        const decoded = Buffer.from(serviceAccountEnv, 'base64').toString('utf8');
        creds = JSON.parse(decoded);
      }
      admin.initializeApp({
        credential: admin.credential.cert(creds)
      });
      firebaseInitialized = true;
      console.log('  [FCM] Firebase Admin SDK initialized via environment credentials.');
      return true;
    }

    // 2. Check file path from environment variable or standard locations
    const customPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const candidatePaths = [
      customPath,
      path.join(__dirname, '../config/firebase-service-account.json'),
      path.join(__dirname, '../firebase-service-account.json'),
      path.join(__dirname, '../../firebase-service-account.json')
    ].filter(Boolean);

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        admin.initializeApp({
          credential: admin.credential.cert(p)
        });
        firebaseInitialized = true;
        console.log(`  [FCM] Firebase Admin SDK initialized using key file: ${p}`);
        return true;
      }
    }

    // 3. Check Google Application Default Credentials
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      firebaseInitialized = true;
      console.log('  [FCM] Firebase Admin SDK initialized using GOOGLE_APPLICATION_CREDENTIALS.');
      return true;
    }

    console.log('  [FCM Info] Firebase Admin SDK credentials not yet detected.');
    console.log('  [FCM Info] Place "firebase-service-account.json" in backend/config/ or set FIREBASE_SERVICE_ACCOUNT in .env');
    return false;
  } catch (initErr) {
    console.error('  [FCM Init Error]:', initErr.message);
    firebaseInitialized = false;
    return false;
  }
}

// Initialize on module load
initFirebase();

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE TOKEN MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

async function registerDeviceToken({ token, adminId, adminName, deviceName, platform }) {
  if (!token) throw new Error('Device token is required');

  try {
    const record = await AdminDeviceToken.findOneAndUpdate(
      { token },
      {
        token,
        adminId: adminId || 'rushi@8001',
        adminName: adminName || 'Rushikesh Rohankar',
        deviceName: deviceName || 'Android Admin Device',
        platform: platform || 'android',
        lastActive: new Date(),
        isActive: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[FCM] Registered admin device token (${record.platform} - ${record.adminName})`);
    return record;
  } catch (err) {
    console.error('[FCM] Error saving device token:', err.message);
    throw err;
  }
}

async function unregisterDeviceToken(token) {
  if (!token) return false;
  try {
    await AdminDeviceToken.findOneAndUpdate({ token }, { isActive: false });
    console.log('[FCM] Deactivated device token');
    return true;
  } catch (err) {
    console.error('[FCM] Error deactivating device token:', err.message);
    return false;
  }
}

async function getActiveTokens() {
  try {
    const list = await AdminDeviceToken.find({ isActive: true }).select('token').lean();
    return list.map(item => item.token).filter(Boolean);
  } catch (err) {
    console.error('[FCM] Error fetching active tokens from MongoDB:', err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────

async function sendMulticastNotification({ type, title, body, data = {}, roomNumber, bookingId, eventKey }) {
  // 1. Deduplication Protection
  if (isDuplicateEvent(eventKey)) {
    console.log(`[FCM Deduplication] Skipping duplicate notification event: ${eventKey}`);
    return { skipped: true, reason: 'duplicate' };
  }

  const notificationId = `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    // 2. Fetch Active Admin Tokens from MongoDB
    const tokens = await getActiveTokens();

    if (!tokens || tokens.length === 0) {
      console.log(`[FCM Notice] No active admin device tokens found in database. Notification recorded.`);
      await NotificationLog.create({
        notificationId,
        type,
        title,
        body,
        roomNumber: String(roomNumber || ''),
        bookingId: String(bookingId || ''),
        recipientsCount: 0,
        status: 'no_tokens',
        errorDetails: 'No registered admin device tokens found in MongoDB.'
      }).catch(e => console.warn('[FCM Log Save]:', e.message));

      return { success: false, reason: 'no_registered_devices' };
    }

    // 3. Verify Firebase Admin initialization
    if (!firebaseInitialized) {
      // Try initializing one more time in case env or file was loaded
      initFirebase();
    }

    if (!firebaseInitialized || !admin) {
      console.warn(`[FCM Simulated] Notification [${title}: ${body}] could not be delivered to ${tokens.length} devices because Firebase credentials are not yet configured in backend.`);
      await NotificationLog.create({
        notificationId,
        type,
        title,
        body,
        roomNumber: String(roomNumber || ''),
        bookingId: String(bookingId || ''),
        recipientsCount: tokens.length,
        status: 'firebase_unconfigured',
        errorDetails: 'Firebase Admin credentials missing. Please configure FIREBASE_SERVICE_ACCOUNT in backend/.env'
      }).catch(e => console.warn('[FCM Log Save]:', e.message));

      return { success: false, reason: 'firebase_unconfigured' };
    }

    // 4. Construct High-Priority FCM Payload for Android & iOS
    const message = {
      notification: {
        title,
        body
      },
      data: {
        type: String(type || 'general'),
        bookingId: String(bookingId || ''),
        roomNumber: String(roomNumber || ''),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        timestamp: new Date().toISOString(),
        ...Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v ?? '')])
        )
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'sadguru_bookings_channel',
          sound: 'default',
          defaultSound: true,
          defaultVibrateTimings: true,
          priority: 'high',
          visibility: 'public'
        }
      },
      tokens
    };

    // 5. Send via Firebase Admin SDK
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`[FCM Success] Sent [${title}] to ${tokens.length} device(s). Success: ${response.successCount}, Failures: ${response.failureCount}`);

    // 6. Automatically prune stale / invalid / uninstalled device tokens
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        console.log(`[FCM Maintenance] Removing ${invalidTokens.length} expired/unregistered token(s) from MongoDB.`);
        await AdminDeviceToken.deleteMany({ token: { $in: invalidTokens } }).catch(e => console.warn('[FCM Prune]:', e.message));
      }
    }

    // 7. Record Notification in MongoDB Audit Log
    await NotificationLog.create({
      notificationId,
      type,
      title,
      body,
      roomNumber: String(roomNumber || ''),
      bookingId: String(bookingId || ''),
      recipientsCount: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
      status: response.successCount > 0 ? 'sent' : 'failed',
      errorDetails: response.failureCount > 0 ? JSON.stringify(response.responses.filter(r => !r.success).map(r => r.error?.message)) : null
    }).catch(e => console.warn('[FCM Log Save]:', e.message));

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (err) {
    console.error('[FCM Error] Failed sending push notification:', err.message);
    await NotificationLog.create({
      notificationId,
      type,
      title,
      body,
      roomNumber: String(roomNumber || ''),
      bookingId: String(bookingId || ''),
      status: 'error',
      errorDetails: err.message
    }).catch(() => {});

    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIFIC APPLICATION EVENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1. Room Booking Notification
 * Triggered whenever a booking is confirmed in MongoDB.
 * Example:
 * Title: New Room Booking
 * Message: Room 103 has been successfully booked.
 * Multiple rooms: Rooms 103, 104 have been successfully booked.
 */
async function sendBookingNotification({ booking, roomNumbers }) {
  if (!booking) return;

  let roomsList = [];
  if (Array.isArray(roomNumbers) && roomNumbers.length > 0) {
    roomsList = roomNumbers;
  } else if (booking.roomNumber) {
    roomsList = [booking.roomNumber];
  }

  let roomText = 'Room';
  if (roomsList.length > 1) {
    roomText = `Rooms ${roomsList.join(', ')}`;
  } else if (roomsList.length === 1) {
    roomText = `Room ${roomsList[0]}`;
  } else {
    roomText = 'Room';
  }

  const title = 'New Room Booking';
  const body = `${roomText} has been successfully booked.`;
  const roomNumberStr = roomsList.join(', ');

  return sendMulticastNotification({
    type: 'booking',
    title,
    body,
    roomNumber: roomNumberStr,
    bookingId: booking.id || '',
    eventKey: `booking_${booking.id || roomNumberStr}`,
    data: {
      customerName: booking.customerName || '',
      stayType: booking.stayType || '',
      advancePaid: booking.advancePaid || '',
      checkIn: booking.checkIn || '',
      checkOut: booking.checkOut || ''
    }
  });
}

/**
 * 2. Room Checkout Notification
 * Triggered whenever a guest checkout is confirmed in MongoDB.
 * Example:
 * Title: Room Checkout Completed
 * Message: Guest has checked out successfully from Room 103.
 */
async function sendCheckoutNotification({ booking, roomNumber, isEarly = false }) {
  const targetRoom = roomNumber || booking?.roomNumber || 'N/A';
  const title = 'Room Checkout Completed';
  const body = `Guest has checked out successfully from Room ${targetRoom}.`;

  return sendMulticastNotification({
    type: 'checkout',
    title,
    body,
    roomNumber: String(targetRoom),
    bookingId: booking?.id || '',
    eventKey: `checkout_${targetRoom}_${booking?.id || ''}_${Date.now()}`,
    data: {
      isEarly: String(isEarly),
      customerName: booking?.customerName || '',
      checkoutTime: booking?.actualCheckOutTime || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  });
}

/**
 * 3. Booking Cancellation Notification
 */
async function sendCancellationNotification({ booking, roomNumber, reason }) {
  const targetRoom = roomNumber || booking?.roomNumber || 'N/A';
  const title = 'Booking Cancelled';
  const body = `Booking for Room ${targetRoom} has been cancelled.`;

  return sendMulticastNotification({
    type: 'cancellation',
    title,
    body,
    roomNumber: String(targetRoom),
    bookingId: booking?.id || '',
    eventKey: `cancel_${booking?.id || targetRoom}`,
    data: {
      reason: reason || ''
    }
  });
}

/**
 * Retrieve delivery audit logs
 */
async function getNotificationLogs(limit = 50) {
  try {
    return await NotificationLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  } catch (err) {
    return [];
  }
}

module.exports = {
  initFirebase,
  registerDeviceToken,
  unregisterDeviceToken,
  sendBookingNotification,
  sendCheckoutNotification,
  sendCancellationNotification,
  getNotificationLogs,
  isFirebaseReady: () => firebaseInitialized
};
