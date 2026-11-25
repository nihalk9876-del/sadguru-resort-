const RAW_URL = import.meta.env.VITE_API_URL || 'https://sadguru-resort-backend.onrender.com';
const API_BASE = `${RAW_URL.replace(/\/+$/, '')}/api`;

function getAuthHeaders() {
  const token = localStorage.getItem('sadguru_admin_token');
  return {
    'Content-Type': 'application/json',
    'x-admin-app': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Public Room & Booking Endpoints
  getRooms: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/rooms${query ? `?${query}` : ''}`);
    return handleResponse(res);
  },

  checkAvailability: async (params) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/rooms/check-availability?${query}`);
    return handleResponse(res);
  },

  getRoom: async (id) => {
    const res = await fetch(`${API_BASE}/rooms/${id}`);
    return handleResponse(res);
  },

  createBooking: async (bookingData) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return handleResponse(res);
  },

  trackBooking: async (bookingId, phone) => {
    const res = await fetch(`${API_BASE}/bookings/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, phone })
    });
    return handleResponse(res);
  },

  cancelBooking: async (id, reason) => {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return handleResponse(res);
  },

  // Swimming Pool Endpoints
  createPoolBooking: async (data) => {
    const res = await fetch(`${API_BASE}/pool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Banquet Hall Endpoints
  createBanquetBooking: async (data) => {
    const res = await fetch(`${API_BASE}/banquet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Lawn Endpoints
  createLawnBooking: async (data) => {
    const res = await fetch(`${API_BASE}/lawn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Packages Endpoints
  getPackages: async () => {
    const res = await fetch(`${API_BASE}/packages`);
    return handleResponse(res);
  },

  bookPackage: async (data) => {
    const res = await fetch(`${API_BASE}/packages/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Contact & Reviews
  submitContact: async (data) => {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getReviews: async () => {
    const res = await fetch(`${API_BASE}/contact/reviews`);
    return handleResponse(res);
  },

  getSettings: async () => {
    const res = await fetch(`${API_BASE}/admin/settings`);
    return handleResponse(res);
  },

  getPoolBookings: async () => {
    const res = await fetch(`${API_BASE}/pool`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  getBanquetBookings: async () => {
    const res = await fetch(`${API_BASE}/banquet`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  getLawnBookings: async () => {
    const res = await fetch(`${API_BASE}/lawn`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  // Admin Endpoints
  adminLogin: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  getAdminMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAllBookings: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/bookings${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateBookingStatus: async (id, status, paymentStatus) => {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, paymentStatus })
    });
    return handleResponse(res);
  },

  updateRoom: async (id, updates) => {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  toggleRoomMaintenance: async (id) => {
    const res = await fetch(`${API_BASE}/rooms/${id}/toggle-maintenance`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updatePackage: async (id, updates) => {
    const res = await fetch(`${API_BASE}/packages/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  updateSettings: async (settings) => {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // ADMIN APP SPECIALIZED SERVICES
  // -------------------------------------------------------------
  getRoomMatrix: async () => {
    const res = await fetch(`${API_BASE}/admin/room-matrix`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createOnSpotBooking: async (bookingData) => {
    const res = await fetch(`${API_BASE}/admin/on-spot-booking`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData)
    });
    return handleResponse(res);
  },

  checkoutRoom: async (roomNumber) => {
    const res = await fetch(`${API_BASE}/admin/checkout-room`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roomNumber })
    });
    return handleResponse(res);
  },

  earlyCheckout: async (roomNumber, actualCheckOutTime) => {
    const res = await fetch(`${API_BASE}/admin/early-checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roomNumber, actualCheckOutTime })
    });
    return handleResponse(res);
  },

  completeCleaning: async (roomNumber) => {
    const res = await fetch(`${API_BASE}/admin/complete-cleaning`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roomNumber })
    });
    return handleResponse(res);
  },

  updateRoomStatus: async (roomNumber, status) => {
    const res = await fetch(`${API_BASE}/admin/room-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roomNumber, status })
    });
    return handleResponse(res);
  },

  addPayment: async (bookingId, amount, paymentMethod = 'Cash', notes = '') => {
    const res = await fetch(`${API_BASE}/admin/add-payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookingId, amount, paymentMethod, notes })
    });
    return handleResponse(res);
  },

  createPoolPass: async (passData) => {
    const res = await fetch(`${API_BASE}/admin/pool-pass`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(passData)
    });
    return handleResponse(res);
  },

  getAdminReports: async (timeframe = 'month', targetDate = null) => {
    let url = `${API_BASE}/admin/reports?timeframe=${timeframe}`;
    if (targetDate) url += `&date=${encodeURIComponent(targetDate)}`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // FCM Device Token Registration
  registerDeviceToken: async ({ token, deviceName, platform }) => {
    const res = await fetch(`${API_BASE}/admin/device-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token, deviceName, platform })
    });
    return handleResponse(res);
  },

  unregisterDeviceToken: async (token) => {
    const res = await fetch(`${API_BASE}/admin/device-token`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token })
    });
    return handleResponse(res);
  },

  getNotificationLogs: async () => {
    const res = await fetch(`${API_BASE}/admin/notification-logs`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // CNN + Server-side Aadhaar OCR
  analyzeAadhaarImage: async (imageBase64) => {
    const res = await fetch(`${API_BASE}/admin/analyze-aadhaar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ imageBase64 })
    });
    return handleResponse(res);
  },

  getOcrModelStatus: async () => {
    const res = await fetch(`${API_BASE}/admin/ocr-status`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
