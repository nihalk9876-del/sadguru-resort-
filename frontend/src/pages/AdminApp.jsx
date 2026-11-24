import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { App as CapApp } from '@capacitor/app';
import { 
  BedDouble, Camera, Waves, TrendingUp, ClipboardList, 
  RefreshCw, LogOut, Wifi, WifiOff, Bell, Sparkles, X, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import RoomMatrixView from '../components/admin-app/RoomMatrixView';
import OnSpotBookingTab from '../components/admin-app/OnSpotBookingTab';
import PoolPassTab from '../components/admin-app/PoolPassTab';
import ReportsTab from '../components/admin-app/ReportsTab';
import { initPushNotifications } from '../services/pushNotificationService';

// Pleasant Web Audio Chimes for Real-Time Events
function playNotificationChime(type = 'booking') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    if (type === 'booking') {
      // Luxury ascending double bell chime (E5 -> B5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.setValueAtTime(987.77, now + 0.16);
      osc2.frequency.setValueAtTime(659.25 * 2, now);
      osc2.frequency.setValueAtTime(987.77 * 2, now + 0.16);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } else if (type === 'checkout') {
      // Distinct alert descending chime (G5 -> C5)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now);
      osc.frequency.setValueAtTime(523.25, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    }
  } catch (e) {
    // Audio not permitted or unsupported
  }
}

export default function AdminApp() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matrix');
  const [rooms, setRooms] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preselectedRoom, setPreselectedRoom] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifHistory, setShowNotifHistory] = useState(false);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(true);
  const [exitToast, setExitToast] = useState(false);

  const lastBackPressRef = useRef(0);

  // Initial Welcome Splash timer (1.3 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeSplash(false);
    }, 1300);

    // Initialize native Firebase Cloud Messaging (FCM) push notifications
    initPushNotifications({
      onNotificationReceived: (notif) => {
        console.log('[AdminApp] Push notification arrived:', notif);
        // Refresh room floor plan & reports automatically
        fetchMatrix();
        fetchReports();
      },
      onNotificationTapped: (notif) => {
        console.log('[AdminApp] User opened notification:', notif);
        switchTab('matrix');
        fetchMatrix();
      }
    });

    return () => clearTimeout(timer);
  }, []);

  // Smart Back Button Navigation: Step back to matrix tab instead of exiting app
  const switchTab = (tabName) => {
    if (tabName !== activeTab) {
      window.history.pushState({ tab: tabName }, '');
      setActiveTab(tabName);
    }
  };

  useEffect(() => {
    // Anchor initial state in browser history
    window.history.replaceState({ tab: 'matrix' }, '');

    const handleBackStep = () => {
      setActiveTab((currentTab) => {
        if (currentTab !== 'matrix') {
          // If on Spot Book, Pool, Reports, or Ledger -> Step back to Rooms (Matrix) view!
          return 'matrix';
        }

        // On root matrix tab: require double-tap within 2s to exit app
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          try {
            CapApp.exitApp();
          } catch (e) {
            window.history.back();
          }
        } else {
          lastBackPressRef.current = now;
          setExitToast(true);
          setTimeout(() => setExitToast(false), 2000);
          // Push state back so next back press remains inside app
          window.history.pushState({ tab: 'matrix' }, '');
        }
        return currentTab;
      });
    };

    // 1. Web / WebView history popstate
    const onPopState = () => {
      handleBackStep();
    };
    window.addEventListener('popstate', onPopState);

    // 2. Capacitor Android hardware back button
    let capListener = null;
    try {
      capListener = CapApp.addListener('backButton', () => {
        handleBackStep();
      });
    } catch (e) {}

    return () => {
      window.removeEventListener('popstate', onPopState);
      if (capListener && capListener.remove) {
        capListener.remove();
      }
    };
  }, []);

  // Request browser desktop notification permissions if permitted
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const addNotification = (item) => {
    const id = Date.now() + Math.random();
    const newNotif = { ...item, id };
    setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);

    // Auto-dismiss from active toast view after 8 seconds
    setTimeout(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, dismissed: true } : n));
    }, 8000);
  };

  useEffect(() => {
    loadMatrixData();

    // Socket.IO Real-time listener setup
    const socket = getSocket();
    socket.on('connect', () => setIsSocketConnected(true));
    socket.on('disconnect', () => setIsSocketConnected(false));
    
    // Live push events from server
    const handleMatrixUpdate = () => loadMatrixData(false);

    // 1. New Booking Push Notification
    const handleBookingCreated = (booking) => {
      loadMatrixData(false);
      playNotificationChime('booking');
      const roomNum = booking?.roomNumber ? `Room ${booking.roomNumber}` : 'Room';
      const guest = booking?.customerName || 'Guest';
      const cat = booking?.category || 'Deluxe Room';
      const amount = booking?.totalAmount ? `₹${booking.totalAmount.toLocaleString('en-IN')}` : '';
      const src = booking?.bookingSource === 'onspot_app' ? 'Spot Allotment' : 'Online Website';

      addNotification({
        type: 'booking',
        title: `🎉 New Reservation: ${roomNum}`,
        guest,
        category: cat,
        amount,
        source: src,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`🛎️ New Reservation: ${roomNum}`, {
            body: `${guest} reserved ${roomNum} (${cat}) - ${src}`,
            icon: '/logo.png'
          });
        } catch (e) {}
      }
    };

    // 2. Check-Out Push Notification
    const handleCheckOut = (data) => {
      loadMatrixData(false);
      playNotificationChime('checkout');
      const roomNum = data?.roomNumber || data?.booking?.roomNumber || 'Room';
      const guest = data?.booking?.customerName || 'Guest';
      const isEarly = data?.isEarlyCheckout || false;

      addNotification({
        type: 'checkout',
        title: `🚪 ${isEarly ? 'Early Check-Out' : 'Check-Out Completed'}: Room ${roomNum}`,
        guest,
        message: `${guest} checked out. Room ${roomNum} is now marked for Cleaning.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`🚪 Check-Out: Room ${roomNum}`, {
            body: `${guest} checked out. Room ${roomNum} needs cleaning.`,
            icon: '/logo.png'
          });
        } catch (e) {}
      }
    };

    socket.on('matrix_updated', handleMatrixUpdate);
    socket.on('booking_created', handleBookingCreated);
    socket.on('booking_updated', handleMatrixUpdate);
    socket.on('booking_cancelled', handleMatrixUpdate);
    socket.on('early_checkout', handleCheckOut);
    socket.on('room_checked_out', handleCheckOut);
    socket.on('room_cleaned', handleMatrixUpdate);
    socket.on('room_status_changed', handleMatrixUpdate);

    // Fallback poll every 20 seconds for non-socket environments
    const pollTimer = setInterval(() => loadMatrixData(false), 20000);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('matrix_updated', handleMatrixUpdate);
      socket.off('booking_created', handleBookingCreated);
      socket.off('booking_updated', handleMatrixUpdate);
      socket.off('booking_cancelled', handleMatrixUpdate);
      socket.off('early_checkout', handleCheckOut);
      socket.off('room_checked_out', handleCheckOut);
      socket.off('room_cleaned', handleMatrixUpdate);
      socket.off('room_status_changed', handleMatrixUpdate);
      clearInterval(pollTimer);
    };
  }, []);

  const loadMatrixData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [matrixRes, bookingsRes] = await Promise.all([
        api.getRoomMatrix(),
        api.getAllBookings().catch(() => ({ bookings: [] }))
      ]);

      if (matrixRes.rooms) setRooms(matrixRes.rooms);
      if (bookingsRes.bookings) setAllBookings(bookingsRes.bookings);
    } catch (err) {
      console.warn('Matrix fetch notice:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSelectRoomForBooking = (roomNum) => {
    setPreselectedRoom(roomNum);
    switchTab('onspot');
  };

  const handleOnSpotBooking = async (bookingData) => {
    const res = await api.createOnSpotBooking(bookingData);
    await loadMatrixData(false);
    return res.booking;
  };

  const handleEarlyCheckout = async (roomNumber, actualCheckOutTime) => {
    await api.earlyCheckout(roomNumber, actualCheckOutTime);
    await loadMatrixData(false);
  };

  const handleCompleteCleaning = async (roomNumber) => {
    await api.completeCleaning(roomNumber);
    await loadMatrixData(false);
  };

  const handleUpdateRoomStatus = async (roomNumber, status) => {
    await api.updateRoomStatus(roomNumber, status);
    await loadMatrixData(false);
  };

  const handleIssuePoolPass = async (passData) => {
    const res = await api.createPoolPass(passData);
    await loadMatrixData(false);
    return res.pass;
  };

  const handleLogout = () => {
    localStorage.removeItem('sadguru_admin_token');
    localStorage.removeItem('sadguru_admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-800 font-sans antialiased flex flex-col items-center">
      
      {/* 1. Opening Luxury Welcome Splash Screen */}
      <AnimatePresence>
        {showWelcomeSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#1C241B] via-[#243023] to-[#121911] text-amber-100 px-6 select-none"
          >
            {/* Ambient gold glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

            {/* Emblem with Gold Accent Spinner */}
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative mb-5 text-center"
            >
              <div className="w-24 h-24 mx-auto rounded-full p-1 bg-white/10 border-2 border-amber-400/60 shadow-[0_0_35px_rgba(223,176,108,0.4)] relative flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Sadguru Resort"
                  className="w-full h-full object-contain rounded-full"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent"
                />
              </div>
            </motion.div>

            {/* Welcome Typography */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center space-y-1.5"
            >
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold font-mono">
                Shri Sadguru Resort
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Welcome Rushi,
              </h2>
              <p className="text-xs text-amber-200/70">
                Opening Operations Portal...
              </p>
            </motion.div>

            {/* Progress Bar Indicator */}
            <div className="w-36 bg-white/10 rounded-full h-1 overflow-hidden mt-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.1, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Double-tap to exit gentle Toast */}
      <AnimatePresence>
        {exitToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 z-50 px-4 py-2 bg-slate-900/90 text-white text-xs font-semibold rounded-full shadow-xl backdrop-blur-sm pointer-events-none border border-white/10"
          >
            Press back again to exit
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile/Tablet Application Frame */}
      <div className="w-full max-w-lg min-h-screen bg-[#F8F9FA] shadow-xl flex flex-col relative border-x border-slate-200">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border border-amber-300 p-0.5 bg-amber-50 shadow-sm flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Shri Sadguru Resort" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  Shri Sadguru Resort
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DFB06C] text-white shadow-xs tracking-wider">
                  ADMIN APP
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {isSocketConnected ? (
                  <Wifi className="w-2.5 h-2.5 text-emerald-500" />
                ) : (
                  <WifiOff className="w-2.5 h-2.5 text-slate-400" />
                )}
                <span className={`text-[9px] font-mono ${isSocketConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isSocketConnected ? 'Live sync active' : 'Polling mode'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Real-time Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifHistory(!showNotifHistory)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition border relative ${
                  notifications.length > 0 && !notifications.every(n => n.dismissed)
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200/60'
                }`}
                title="Recent Alerts & Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.dismissed).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {notifications.filter(n => !n.dismissed).length}
                  </span>
                )}
              </button>

              {/* Notification History Dropdown */}
              {showNotifHistory && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-600" /> Live Resort Alerts
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-slate-400 hover:text-red-600 font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-center py-3 text-[11px]">No recent alerts.</p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-[11px] space-y-0.5 ${
                            n.type === 'booking'
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>{n.title}</span>
                            <span className="text-[9px] text-slate-400 font-normal">{n.time}</span>
                          </div>
                          <p className="text-slate-600 text-[10px]">
                            {n.type === 'booking' ? `${n.guest} (${n.category}) • ${n.amount}` : n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => loadMatrixData(true)}
              disabled={loading}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition border border-slate-200/60"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition border border-red-200/60"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Real-time Floating Notification Toasts (Check-out & New Booking) */}
        <div className="absolute top-16 left-3 right-3 z-40 pointer-events-none space-y-2">
          {notifications.filter(n => !n.dismissed).slice(0, 2).map(n => (
            <div
              key={n.id}
              className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 ${
                n.type === 'booking'
                  ? 'bg-gradient-to-r from-emerald-50 via-white to-amber-50/50 border-emerald-300 text-emerald-950 shadow-emerald-900/10'
                  : 'bg-gradient-to-r from-blue-50 via-white to-indigo-50/50 border-blue-300 text-blue-950 shadow-blue-900/10'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  n.type === 'booking'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                }`}
              >
                {n.type === 'booking' ? <Sparkles className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 leading-tight truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-0.5 truncate">
                  {n.type === 'booking' ? (
                    <span><strong>{n.guest}</strong> • {n.category} • <strong className="text-emerald-700">{n.amount}</strong></span>
                  ) : (
                    <span>{n.message}</span>
                  )}
                </p>
                {n.source && (
                  <span className="inline-block mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {n.source}
                  </span>
                )}
              </div>
              <button
                onClick={() => setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, dismissed: true } : item))}
                className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Scrollable Main Screen Content */}
        <main className="flex-1 p-3.5 sm:p-4 pb-24 overflow-y-auto space-y-4">
          
          {activeTab === 'matrix' && (
            <RoomMatrixView
              rooms={rooms}
              loading={loading}
              onRefresh={() => loadMatrixData(true)}
              onSelectRoomForBooking={handleSelectRoomForBooking}
              onEarlyCheckout={handleEarlyCheckout}
              onCompleteCleaning={handleCompleteCleaning}
              onUpdateRoomStatus={handleUpdateRoomStatus}
            />
          )}

          {activeTab === 'onspot' && (
            <OnSpotBookingTab
              rooms={rooms}
              preselectedRoom={preselectedRoom}
              onClearPreselectedRoom={() => setPreselectedRoom(null)}
              onBookingSuccess={handleOnSpotBooking}
            />
          )}

          {activeTab === 'pool' && (
            <PoolPassTab onIssuePass={handleIssuePoolPass} />
          )}

          {activeTab === 'reports' && (
            <ReportsTab />
          )}

          {activeTab === 'records' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-base">All Resort Bookings Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synced live with website and front desk • {allBookings.length} total entries
                </p>
              </div>

              <div className="space-y-2">
                {allBookings.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
                    No bookings recorded yet.
                  </div>
                ) : allBookings.map((b, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-slate-900">Room {b.roomNumber || '-'}</span>
                        {b.bookingSource === 'on_spot_walkin' && (
                          <span className="ml-2 text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">WALK-IN</span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Checked-In' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        b.status === 'Checked-Out' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        b.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="font-semibold text-slate-900">{b.customerName}</span>
                      <span className="font-mono text-slate-500">{b.phone}</span>
                    </div>
                    {b.aadhaarNumber && (
                      <div className="text-[11px] text-amber-700 font-mono">
                        Aadhaar: {b.aadhaarNumber} {b.age ? `(Age ${b.age})` : ''}
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
                      <span>
                        <strong className="text-slate-900">₹{(b.advancePaid || b.totalAmount || 0).toLocaleString('en-IN')}</strong> paid
                        {b.remainingBalance > 0 && <span className="text-red-500 ml-1">• ₹{b.remainingBalance.toLocaleString('en-IN')} due</span>}
                      </span>
                      <span>Till: <strong>{b.checkOut}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* Floating Bottom Navigation Bar */}
        <div className="fixed bottom-3 inset-x-0 max-w-lg mx-auto px-3.5 z-40 pointer-events-none">
          <nav className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl px-2 py-1.5 flex items-center justify-between">
            
            <button
              onClick={() => switchTab('matrix')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                activeTab === 'matrix' ? 'bg-[#FDE68A]/60 text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span className="text-[10px]">Rooms (9)</span>
            </button>

            <button
              onClick={() => switchTab('onspot')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                activeTab === 'onspot' ? 'bg-[#FDE68A]/60 text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span className="text-[10px]">Spot Book</span>
            </button>

            <button
              onClick={() => switchTab('pool')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                activeTab === 'pool' ? 'bg-[#FDE68A]/60 text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Waves className="w-4 h-4" />
              <span className="text-[10px]">Pool Pass</span>
            </button>

            <button
              onClick={() => switchTab('reports')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                activeTab === 'reports' ? 'bg-[#FDE68A]/60 text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px]">Reports</span>
            </button>

            <button
              onClick={() => switchTab('records')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                activeTab === 'records' ? 'bg-[#FDE68A]/60 text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="text-[10px]">Ledger</span>
            </button>

          </nav>
        </div>

      </div>
    </div>
  );
}
