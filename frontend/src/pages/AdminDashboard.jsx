import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, Calendar, BedDouble, Waves, 
  Crown, Trees, Package, Settings, LogOut, Search, Filter, 
  Download, Plus, Edit, CheckCircle, XCircle, Clock, DollarSign, 
  AlertCircle, RefreshCw, Eye, ArrowUpRight, TrendingUp, Check, Users 
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, bookings, rooms, pool, events, packages, settings

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [poolBookings, setPoolBookings] = useState([]);
  const [banquetBookings, setBanquetBookings] = useState([]);
  const [lawnBookings, setLawnBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [resortSettings, setResortSettings] = useState(null);

  // Booking filters state
  const [bookingFilterType, setBookingFilterType] = useState('all'); // 'all', 'today', 'tomorrow', 'upcoming', 'past'
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [bookingPaymentFilter, setBookingPaymentFilter] = useState('');

  // Selected booking for detail view
  const [selectedBookingModal, setSelectedBookingModal] = useState(null);

  // Room price edit modal
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoomPrice, setNewRoomPrice] = useState('');

  // Package price edit modal
  const [editingPackage, setEditingPackage] = useState(null);
  const [newPackagePrice, setNewPackagePrice] = useState('');

  // Settings form
  const [settingsForm, setSettingsForm] = useState(null);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState('');

  // Verify auth on mount
  useEffect(() => {
    const token = localStorage.getItem('sadguru_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadAllAdminData();
  }, [navigate]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, roomsRes, bookingsRes, poolRes, bqRes, lwRes, pkgRes, settRes] = await Promise.all([
        api.getAdminStats(),
        api.getRooms(),
        api.getAllBookings(),
        fetch('/api/pool', { headers: { Authorization: `Bearer ${localStorage.getItem('sadguru_admin_token')}` } }).then(r => r.json()),
        fetch('/api/banquet', { headers: { Authorization: `Bearer ${localStorage.getItem('sadguru_admin_token')}` } }).then(r => r.json()),
        fetch('/api/lawn', { headers: { Authorization: `Bearer ${localStorage.getItem('sadguru_admin_token')}` } }).then(r => r.json()),
        api.getPackages(),
        api.getSettings()
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (roomsRes.rooms) setRooms(roomsRes.rooms);
      if (bookingsRes.bookings) setBookings(bookingsRes.bookings);
      if (poolRes.bookings) setPoolBookings(poolRes.bookings);
      if (bqRes.bookings) setBanquetBookings(bqRes.bookings);
      if (lwRes.bookings) setLawnBookings(lwRes.bookings);
      if (pkgRes.packages) setPackages(pkgRes.packages);
      if (settRes.settings) {
        setResortSettings(settRes.settings);
        setSettingsForm(settRes.settings);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      if (err.message && err.message.toLowerCase().includes('token')) {
        localStorage.removeItem('sadguru_admin_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sadguru_admin_token');
    localStorage.removeItem('sadguru_admin_user');
    navigate('/admin/login');
  };

  // Toggle maintenance on room
  const handleToggleMaintenance = async (roomId) => {
    try {
      await api.toggleRoomMaintenance(roomId);
      loadAllAdminData();
    } catch (err) {
      alert(`Failed to toggle maintenance: ${err.message}`);
    }
  };

  // Save room price
  const handleSaveRoomPrice = async () => {
    if (!editingRoom || !newRoomPrice) return;
    try {
      await api.updateRoom(editingRoom.id, { price: Number(newRoomPrice) });
      setEditingRoom(null);
      loadAllAdminData();
    } catch (err) {
      alert(`Failed to update price: ${err.message}`);
    }
  };

  // Save package price
  const handleSavePackagePrice = async () => {
    if (!editingPackage || !newPackagePrice) return;
    try {
      await api.updatePackage(editingPackage.id, { price: Number(newPackagePrice) });
      setEditingPackage(null);
      loadAllAdminData();
    } catch (err) {
      alert(`Failed to update package: ${err.message}`);
    }
  };

  // Update booking status
  const handleUpdateBookingStatus = async (id, status, paymentStatus = null) => {
    try {
      await api.updateBookingStatus(id, status, paymentStatus);
      loadAllAdminData();
      if (selectedBookingModal && selectedBookingModal.id === id) {
        setSelectedBookingModal(prev => ({ ...prev, status, paymentStatus: paymentStatus || prev.paymentStatus }));
      }
    } catch (err) {
      alert(`Failed to update booking status: ${err.message}`);
    }
  };

  // Cancel booking & release room
  const handleCancelBooking = async (id) => {
    const confirmCancel = window.confirm(`Cancel reservation ${id}? This will immediately return the room to available inventory.`);
    if (!confirmCancel) return;
    try {
      await api.cancelBooking(id, 'Cancelled by Resort Management');
      loadAllAdminData();
      if (selectedBookingModal && selectedBookingModal.id === id) {
        setSelectedBookingModal(prev => ({ ...prev, status: 'Cancelled' }));
      }
    } catch (err) {
      alert(`Failed to cancel booking: ${err.message}`);
    }
  };

  // Save settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaveMsg('');
    try {
      await api.updateSettings(settingsForm);
      setSettingsSaveMsg('Resort configuration saved successfully.');
      setTimeout(() => setSettingsSaveMsg(''), 3000);
      loadAllAdminData();
    } catch (err) {
      alert(`Failed to save settings: ${err.message}`);
    }
  };

  // Export Bookings to CSV
  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Type', 'Room/Event', 'Customer Name', 'Phone', 'Email', 'Check In/Date', 'Check Out', 'Total Amount', 'Paid Amount', 'Status', 'Payment Status'];
    const rows = bookings.map(b => [
      b.id,
      b.type || 'room',
      b.roomNumber ? `Room ${b.roomNumber}` : (b.packageName || 'Event'),
      `"${b.customerName}"`,
      b.phone,
      b.email,
      b.checkIn || b.date,
      b.checkOut || '-',
      b.totalAmount || b.estimatedAmount,
      b.advancePaid,
      b.status,
      b.paymentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sadguru_resort_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered bookings
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const filteredBookings = bookings.filter(b => {
    // Quick date filters
    if (bookingFilterType === 'today' && b.checkIn !== todayStr) return false;
    if (bookingFilterType === 'tomorrow' && b.checkIn !== tomorrowStr) return false;
    if (bookingFilterType === 'upcoming' && (b.checkIn <= todayStr || b.status === 'Cancelled')) return false;
    if (bookingFilterType === 'past' && b.checkOut > todayStr) return false;

    // Search query
    if (bookingSearch) {
      const q = bookingSearch.toLowerCase();
      const match = 
        (b.id && b.id.toLowerCase().includes(q)) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.phone && b.phone.includes(q)) ||
        (String(b.roomNumber).includes(q));
      if (!match) return false;
    }

    // Category
    if (bookingCategoryFilter && b.category && b.category.toLowerCase() !== bookingCategoryFilter.toLowerCase()) {
      return false;
    }

    // Status
    if (bookingStatusFilter && b.status.toLowerCase() !== bookingStatusFilter.toLowerCase()) {
      return false;
    }

    // Payment Status
    if (bookingPaymentFilter && b.paymentStatus && b.paymentStatus.toLowerCase() !== bookingPaymentFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-resort-cream flex text-resort-charcoal">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-resort-oliveDeep text-resort-cream flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-resort-gold/30">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 border border-resort-gold rounded-full flex items-center justify-center bg-resort-gold/10">
              <span className="font-display font-bold text-sm text-resort-gold">SR</span>
            </div>
            <div>
              <span className="font-display tracking-[0.2em] font-bold text-sm uppercase text-white block">
                SADGURU
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-resort-gold block">
                ADMIN PORTAL
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'overview'
                  ? 'gold-gradient-bg text-resort-oliveDeep font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'bookings'
                  ? 'gold-gradient-bg text-resort-oliveDeep font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Room Bookings ({bookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'rooms'
                  ? 'gold-gradient-bg text-resort-oliveDeep font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>Room Inventory (9 Rooms)</span>
            </button>

            <button
              onClick={() => setActiveTab('pool')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'pool'
                  ? 'gold-gradient-bg text-resort-oliveDeep font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Waves className="w-4 h-4" />
              <span>Swimming Pool ({poolBookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'events'
                  ? 'gold-gradient-bg text-resort-oliveDeep font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Banquet & Lawns</span>
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'packages'
                  ? 'gold-gradient-bg text-resort-oliveDeep font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Packages ({packages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'settings'
                  ? 'gold-gradient-bg text-resort-oliveDeep font-bold shadow-sm'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Resort Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/app"
            className="w-full flex items-center justify-between text-xs text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 py-2.5 px-3 rounded-xl hover:bg-amber-500/20 transition"
          >
            <span>📱 Launch Mobile App (POS)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-white py-2 px-3 rounded-lg hover:bg-white/5"
          >
            <span>View Live Website</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 py-2 px-3 rounded-lg hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-resort-beigeDark/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-lg text-resort-oliveDeep capitalize">
              {activeTab === 'overview' && 'Executive Overview & Live Occupancy'}
              {activeTab === 'bookings' && 'Room Booking Management'}
              {activeTab === 'rooms' && '9 Rooms Inventory & Maintenance'}
              {activeTab === 'pool' && 'Swimming Pool Passes & Slots'}
              {activeTab === 'events' && 'Banquet Hall & Lawn Event Bookings'}
              {activeTab === 'packages' && 'Resort Package Manager'}
              {activeTab === 'settings' && 'Resort Policies & Contact Settings'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllAdminData}
              className="p-2 rounded-xl border border-resort-beigeDark hover:bg-resort-cream text-gray-600 text-xs flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/"
              className="py-1.5 px-3 rounded-xl border border-resort-beigeDark text-xs font-semibold text-resort-oliveDeep hover:bg-resort-cream flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-resort-gold" />
              <span>Visit Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs flex md:hidden"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Tab Pills */}
        <div className="md:hidden flex overflow-x-auto gap-2 p-3 bg-resort-cream border-b border-resort-beigeDark">
          {['overview', 'bookings', 'rooms', 'pool', 'events', 'packages', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                activeTab === tab ? 'gold-gradient-bg text-resort-oliveDeep' : 'bg-white border text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-8">
          
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Primary KPI Grid as strictly required */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-resort-beigeDark shadow-sm">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Total Bookings</span>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-resort-oliveDeep mt-1 block">
                    {stats.summary.totalBookings}
                  </span>
                  <span className="text-[11px] text-gray-500">Across all categories</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-resort-beigeDark shadow-sm">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Today's Check-ins</span>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 block">
                    {stats.summary.todayBookingsCount}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">Arrivals today</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-resort-beigeDark shadow-sm">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Upcoming Bookings</span>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-blue-700 mt-1 block">
                    {stats.summary.upcomingBookingsCount}
                  </span>
                  <span className="text-[11px] text-gray-500">Scheduled future stays</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-resort-beigeDark shadow-sm">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Total Revenue</span>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-resort-gold mt-1 block">
                    ₹{stats.summary.totalRevenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-gray-500">Collected advances & full</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-resort-beigeDark shadow-sm">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Pending Balance</span>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-amber-700 mt-1 block">
                    ₹{stats.summary.pendingPayments.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-amber-600">To collect at check-in</span>
                </div>
              </div>

              {/* Room Occupancy Status Today */}
              <div className="bg-white p-6 rounded-3xl border border-resort-beigeDark shadow-luxury space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-resort-beigeDark/70">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block">
                      Live Physical Room Inventory (9 Rooms Total)
                    </span>
                    <h3 className="font-display text-xl font-bold text-resort-oliveDeep mt-0.5">
                      Current Room Occupancy & Availability
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Available: {stats.summary.availableRooms}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-amber-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Occupied: {stats.summary.occupiedRooms}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-red-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      Maintenance: {stats.summary.maintenanceRooms}
                    </span>
                  </div>
                </div>

                {/* 9 Room Badges */}
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-3">
                  {rooms.map((r) => {
                    const isOccupiedToday = (bookings || []).some(b => 
                      b.status !== 'Cancelled' && 
                      (String(b.roomId) === String(r.id) || String(b.roomNumber) === String(r.roomNumber)) &&
                      b.checkIn <= todayStr && b.checkOut > todayStr
                    );

                    const statusColor = r.status === 'Maintenance' 
                      ? 'border-red-400 bg-red-50 text-red-900' 
                      : isOccupiedToday 
                      ? 'border-amber-400 bg-amber-50 text-amber-900' 
                      : 'border-emerald-400 bg-emerald-50 text-emerald-900';

                    return (
                      <div
                        key={r.id}
                        className={`p-3 rounded-2xl border-2 text-center transition-all ${statusColor}`}
                      >
                        <span className="font-mono text-xs uppercase tracking-wider text-gray-500 block font-bold">
                          {r.roomNumber}
                        </span>
                        <span className="text-xs font-bold block mt-1">
                          {r.status === 'Maintenance' ? 'Closed' : isOccupiedToday ? 'Occupied' : 'Ready'}
                        </span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          {r.category.includes('Family') ? 'Family' : 'Deluxe'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day-Wise & Monthly Reports Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 7-Day Day-Wise Revenue & Bookings (7 cols) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-resort-beigeDark shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-resort-beigeDark">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block">
                        Day-Wise Trend (Last 7 Days)
                      </span>
                      <h4 className="font-display text-lg font-bold text-resort-oliveDeep">
                        Daily Bookings & Revenue
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {stats.dailyStats.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-resort-cream border border-resort-beigeDark text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-10 font-bold text-resort-oliveDeep">{d.day}</span>
                          <span className="text-gray-500 font-mono">{d.date}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-gray-600">
                            <strong>{d.bookings}</strong> bookings
                          </span>
                          <span className="font-bold text-resort-gold text-sm w-24 text-right">
                            ₹{d.revenue.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's & Tomorrow's Arrivals (5 cols) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-resort-beigeDark shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-resort-beigeDark">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block">
                        Immediate Operations
                      </span>
                      <h4 className="font-display text-lg font-bold text-resort-oliveDeep">
                        Today & Tomorrow Check-ins
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                      Today's Arrivals ({stats.todayBookings.length})
                    </span>
                    {stats.todayBookings.length > 0 ? (
                      stats.todayBookings.map(b => (
                        <div key={b.id} className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-emerald-900">
                            <span>Room {b.roomNumber} • {b.customerName}</span>
                            <span>{b.phone}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 text-[11px]">
                            <span>{b.nights} nights stay</span>
                            <span className="text-emerald-700 font-semibold">{b.paymentStatus}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No scheduled room check-ins for today.</p>
                    )}

                    <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block pt-3">
                      Tomorrow's Arrivals ({stats.tomorrowBookings.length})
                    </span>
                    {stats.tomorrowBookings.length > 0 ? (
                      stats.tomorrowBookings.map(b => (
                        <div key={b.id} className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-blue-900">
                            <span>Room {b.roomNumber} • {b.customerName}</span>
                            <span>{b.phone}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 text-[11px]">
                            <span>{b.nights} nights stay</span>
                            <span className="text-blue-700 font-semibold">{b.paymentStatus}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No scheduled room check-ins for tomorrow.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: ROOM BOOKING MANAGEMENT */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Filter & Action Toolbar */}
              <div className="bg-white p-5 rounded-3xl border border-resort-beigeDark shadow-sm space-y-4">
                
                {/* Quick Date Filters row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { key: 'all', label: 'All Bookings' },
                      { key: 'today', label: `Today's Bookings` },
                      { key: 'tomorrow', label: `Tomorrow's Bookings` },
                      { key: 'upcoming', label: 'Upcoming Bookings' },
                      { key: 'past', label: 'Past Bookings' },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setBookingFilterType(f.key)}
                        className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                          bookingFilterType === f.key
                            ? 'gold-gradient-bg text-resort-oliveDeep shadow-sm'
                            : 'bg-resort-cream text-gray-600 hover:text-resort-oliveDeep'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="py-2 px-4 rounded-xl border border-resort-beigeDark hover:border-resort-gold text-xs font-bold text-resort-oliveDeep flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-resort-gold" />
                    <span>Download CSV Report</span>
                  </button>
                </div>

                {/* Multi-Parameter Filters row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-resort-beigeDark/60">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search ID, guest, phone..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-resort-gold"
                    />
                  </div>

                  {/* Room Category */}
                  <div>
                    <select
                      value={bookingCategoryFilter}
                      onChange={(e) => setBookingCategoryFilter(e.target.value)}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                    >
                      <option value="">All Room Categories</option>
                      <option value="Deluxe AC">Deluxe AC</option>
                      <option value="Deluxe Family">Deluxe Family</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <select
                      value={bookingStatusFilter}
                      onChange={(e) => setBookingStatusFilter(e.target.value)}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                    >
                      <option value="">All Statuses</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <select
                      value={bookingPaymentFilter}
                      onChange={(e) => setBookingPaymentFilter(e.target.value)}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                    >
                      <option value="">All Payment States</option>
                      <option value="Paid">Fully Paid</option>
                      <option value="Partial Advance">Partial Advance</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-3xl border border-resort-beigeDark shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-resort-cream border-b border-resort-beigeDark text-gray-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Booking ID</th>
                        <th className="py-3.5 px-4">Guest Name</th>
                        <th className="py-3.5 px-4">Room & Category</th>
                        <th className="py-3.5 px-4">Dates</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Payment</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-resort-beigeDark/60">
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-resort-cream/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-resort-oliveDeep">
                              {b.id}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold block text-resort-oliveDeep">{b.customerName}</span>
                              <span className="text-[11px] text-gray-500">{b.phone}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold block">Room {b.roomNumber}</span>
                              <span className="text-[11px] text-gray-500">{b.category}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="block font-medium">{b.checkIn} to {b.checkOut}</span>
                              <span className="text-[10px] text-gray-500">{b.nights} night(s) • {b.guests} guest(s)</span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-resort-oliveDeep">
                              ₹{b.totalAmount?.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                b.paymentStatus === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.paymentStatus === 'Partial Advance'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {b.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                b.status === 'Confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedBookingModal(b)}
                                  className="p-1.5 rounded-lg border border-resort-beigeDark hover:bg-white text-gray-600 hover:text-resort-oliveDeep"
                                  title="View Details"
                                >
                                  <Eye className="w-3.5 h-3.5 text-resort-gold" />
                                </button>

                                {b.status !== 'Cancelled' && (
                                  <button
                                    onClick={() => handleCancelBooking(b.id)}
                                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                                    title="Cancel & Release Room"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-gray-400 italic">
                            No reservations found matching the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ROOM MANAGEMENT (ALL 9 ROOMS) */}
          {activeTab === 'rooms' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block">
                    Room Inventory
                  </span>
                  <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
                    9 Luxury Resort Rooms
                  </h3>
                </div>
                <div className="text-xs text-gray-500">
                  7 Deluxe AC (101-107) • 2 Deluxe Family (201-202)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-3xl overflow-hidden border border-resort-beigeDark shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo Header */}
                      <div className="relative h-44 overflow-hidden bg-gray-100">
                        <img
                          src={room.images[0]}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">
                          Room {room.roomNumber} • {room.category}
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            room.status === 'Maintenance'
                              ? 'bg-red-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {room.status}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-3">
                        <h4 className="font-display font-bold text-lg text-resort-oliveDeep">
                          {room.name}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {room.description}
                        </p>

                        <div className="flex items-center justify-between text-xs py-2 border-y border-resort-beigeDark/50">
                          <span className="text-gray-500">Nightly Price:</span>
                          <strong className="text-resort-gold text-sm">
                            ₹{room.price.toLocaleString('en-IN')}
                          </strong>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Max Capacity: {room.capacity} Guests</span>
                          <span>Floor: {room.floor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-5 pt-0 border-t border-resort-beigeDark/50 flex items-center justify-between gap-2 mt-4 pt-4">
                      <button
                        onClick={() => {
                          setEditingRoom(room);
                          setNewRoomPrice(room.price);
                        }}
                        className="py-2 px-3 rounded-xl border border-resort-beigeDark hover:border-resort-gold text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5 text-resort-gold" />
                        <span>Edit Price</span>
                      </button>

                      <button
                        onClick={() => handleToggleMaintenance(room.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold ${
                          room.status === 'Maintenance'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-red-50 text-red-700 border border-red-300'
                        }`}
                      >
                        {room.status === 'Maintenance' ? 'Re-open Room' : 'Block Maintenance'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: SWIMMING POOL BOOKINGS */}
          {activeTab === 'pool' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-cyan-700 font-bold block">
                    Pool Facility Passes
                  </span>
                  <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
                    Swimming Pool Slot Bookings
                  </h3>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-resort-beigeDark shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-resort-cream border-b border-resort-beigeDark text-gray-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Pass ID</th>
                      <th className="py-3.5 px-4">Visitor Name</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">Visit Date</th>
                      <th className="py-3.5 px-4">Slot</th>
                      <th className="py-3.5 px-4">Visitors</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-resort-beigeDark/60">
                    {poolBookings.map((p) => (
                      <tr key={p.id} className="hover:bg-resort-cream/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-900">{p.id}</td>
                        <td className="py-3.5 px-4 font-bold">{p.customerName}</td>
                        <td className="py-3.5 px-4">{p.phone}</td>
                        <td className="py-3.5 px-4 font-semibold">{p.date}</td>
                        <td className="py-3.5 px-4">{p.timeSlot}</td>
                        <td className="py-3.5 px-4">{p.adultCount} Adult, {p.childCount} Child</td>
                        <td className="py-3.5 px-4 font-bold text-cyan-800">₹{p.totalAmount}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: BANQUET & LAWN EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Banquet Bookings */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-resort-oliveDeep">
                  Banquet Hall Reservations ({banquetBookings.length})
                </h3>
                <div className="bg-white rounded-3xl border border-resort-beigeDark shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-resort-cream border-b border-resort-beigeDark text-gray-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">ID</th>
                        <th className="py-3.5 px-4">Client</th>
                        <th className="py-3.5 px-4">Event Date & Slot</th>
                        <th className="py-3.5 px-4">Occasion</th>
                        <th className="py-3.5 px-4">Guests</th>
                        <th className="py-3.5 px-4">Estimate</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-resort-beigeDark/60">
                      {banquetBookings.map((bq) => (
                        <tr key={bq.id} className="hover:bg-resort-cream/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-resort-oliveDeep">{bq.id}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold block">{bq.customerName}</span>
                            <span className="text-[11px] text-gray-500">{bq.phone}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold block">{bq.date}</span>
                            <span className="text-[10px] text-gray-500">{bq.timeSlot}</span>
                          </td>
                          <td className="py-3.5 px-4">{bq.eventType}</td>
                          <td className="py-3.5 px-4">{bq.guestCount} Pax</td>
                          <td className="py-3.5 px-4 font-bold text-resort-gold">₹{bq.estimatedAmount?.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {bq.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lawn Bookings */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-resort-oliveDeep">
                  Lush Green Lawn Reservations ({lawnBookings.length})
                </h3>
                <div className="bg-white rounded-3xl border border-resort-beigeDark shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-resort-cream border-b border-resort-beigeDark text-gray-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">ID</th>
                        <th className="py-3.5 px-4">Host Name</th>
                        <th className="py-3.5 px-4">Event Date</th>
                        <th className="py-3.5 px-4">Occasion</th>
                        <th className="py-3.5 px-4">Guests</th>
                        <th className="py-3.5 px-4">Estimate</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-resort-beigeDark/60">
                      {lawnBookings.map((lw) => (
                        <tr key={lw.id} className="hover:bg-resort-cream/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-900">{lw.id}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold block">{lw.customerName}</span>
                            <span className="text-[11px] text-gray-500">{lw.phone}</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold">{lw.date}</td>
                          <td className="py-3.5 px-4">{lw.eventType}</td>
                          <td className="py-3.5 px-4">{lw.guestCount} Pax</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-800">₹{lw.estimatedAmount?.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {lw.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: PACKAGES MANAGER */}
          {activeTab === 'packages' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block">
                    Curated Offerings
                  </span>
                  <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
                    All 8 Resort Packages
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-3xl p-5 border border-resort-beigeDark shadow-sm flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-32 rounded-2xl overflow-hidden bg-gray-100">
                        <img src={pkg.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-display font-bold text-base text-resort-oliveDeep">
                        {pkg.name}
                      </h4>
                      <div className="flex items-baseline justify-between pt-2 border-t border-resort-beigeDark">
                        <span className="text-xs text-gray-500">Active Price:</span>
                        <strong className="text-resort-gold text-lg">
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingPackage(pkg);
                        setNewPackagePrice(pkg.price);
                      }}
                      className="mt-4 w-full py-2 rounded-xl border border-resort-beigeDark hover:border-resort-gold text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-resort-gold" />
                      <span>Update Price</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: RESORT SETTINGS */}
          {activeTab === 'settings' && settingsForm && (
            <div className="max-w-2xl bg-white p-8 rounded-3xl border border-resort-beigeDark shadow-sm space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block">
                  Configuration
                </span>
                <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
                  Resort Contact & Policies
                </h3>
              </div>

              {settingsSaveMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {settingsSaveMsg}
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase text-gray-500 font-bold block mb-1">
                      Resort Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.resortName || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, resortName: e.target.value })}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase text-gray-500 font-bold block mb-1">
                      Contact Hotline
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase text-gray-500 font-bold block mb-1">
                      Adult Pool Ticket (₹)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.adultPoolTicket || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, adultPoolTicket: Number(e.target.value) })}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase text-gray-500 font-bold block mb-1">
                      Child Pool Ticket (₹)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.childPoolTicket || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, childPoolTicket: Number(e.target.value) })}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase text-gray-500 font-bold block mb-1">
                    Pool Timings
                  </label>
                  <input
                    type="text"
                    value={settingsForm.poolTimings || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, poolTimings: e.target.value })}
                    className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase text-gray-500 font-bold block mb-1">
                    Official Address
                  </label>
                  <input
                    type="text"
                    value={settingsForm.address || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5"
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 px-8 rounded-xl gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow"
                >
                  Save Configuration
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* Booking Details Modal */}
      {selectedBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-resort-beigeDark">
            <div className="flex items-center justify-between pb-3 border-b border-resort-beigeDark">
              <div>
                <span className="text-xs uppercase tracking-wider text-resort-gold font-bold block">
                  Reservation Inspector
                </span>
                <h4 className="font-mono text-lg font-bold text-resort-oliveDeep">{selectedBookingModal.id}</h4>
              </div>
              <button onClick={() => setSelectedBookingModal(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block">Customer:</span>
                <strong className="text-resort-oliveDeep">{selectedBookingModal.customerName}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Phone:</span>
                <strong>{selectedBookingModal.phone}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Dates:</span>
                <strong>{selectedBookingModal.checkIn} to {selectedBookingModal.checkOut}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Room:</span>
                <strong>Room {selectedBookingModal.roomNumber} ({selectedBookingModal.category})</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Total Amount:</span>
                <strong>₹{selectedBookingModal.totalAmount?.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Advance Paid:</span>
                <strong className="text-emerald-700">₹{selectedBookingModal.advancePaid?.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Quick Status Modifiers */}
            <div className="p-4 rounded-xl bg-resort-cream border border-resort-beigeDark space-y-3">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">
                Update Status
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateBookingStatus(selectedBookingModal.id, 'Confirmed')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold"
                >
                  Confirm Stay
                </button>
                <button
                  onClick={() => handleUpdateBookingStatus(selectedBookingModal.id, 'Completed')}
                  className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => handleUpdateBookingStatus(selectedBookingModal.id, null, 'Paid')}
                  className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold"
                >
                  Mark Fully Paid
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-resort-beigeDark">
              <button
                onClick={() => window.print()}
                className="text-xs text-gray-600 font-semibold underline"
              >
                Print Voucher
              </button>
              <button
                onClick={() => setSelectedBookingModal(null)}
                className="py-2 px-6 rounded-xl gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Price Edit Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-resort-beigeDark">
            <h4 className="font-display font-bold text-lg text-resort-oliveDeep">
              Update Price for Room {editingRoom.roomNumber}
            </h4>
            <div>
              <label className="text-[11px] text-gray-500 font-bold uppercase block mb-1">
                New Price per Night (₹)
              </label>
              <input
                type="number"
                value={newRoomPrice}
                onChange={(e) => setNewRoomPrice(e.target.value)}
                className="w-full text-xs font-bold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingRoom(null)}
                className="py-2 px-4 rounded-xl border text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoomPrice}
                className="py-2 px-5 rounded-xl gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Price Edit Modal */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-resort-beigeDark">
            <h4 className="font-display font-bold text-lg text-resort-oliveDeep">
              Update Package Price
            </h4>
            <p className="text-xs text-gray-500">{editingPackage.name}</p>
            <div>
              <label className="text-[11px] text-gray-500 font-bold uppercase block mb-1">
                New Package Rate (₹)
              </label>
              <input
                type="number"
                value={newPackagePrice}
                onChange={(e) => setNewPackagePrice(e.target.value)}
                className="w-full text-xs font-bold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingPackage(null)}
                className="py-2 px-4 rounded-xl border text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePackagePrice}
                className="py-2 px-5 rounded-xl gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
