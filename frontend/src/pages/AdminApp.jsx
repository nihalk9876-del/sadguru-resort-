import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BedDouble, Camera, Waves, TrendingUp, ClipboardList, 
  RefreshCw, LogOut, Wifi, WifiOff
} from 'lucide-react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import RoomMatrixView from '../components/admin-app/RoomMatrixView';
import OnSpotBookingTab from '../components/admin-app/OnSpotBookingTab';
import PoolPassTab from '../components/admin-app/PoolPassTab';
import ReportsTab from '../components/admin-app/ReportsTab';

export default function AdminApp() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matrix');
  const [rooms, setRooms] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preselectedRoom, setPreselectedRoom] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    loadMatrixData();

    // Socket.IO Real-time listener setup
    const socket = getSocket();
    socket.on('connect', () => setIsSocketConnected(true));
    socket.on('disconnect', () => setIsSocketConnected(false));
    
    // Live push events from server - refresh matrix instantly
    const handleMatrixUpdate = () => loadMatrixData(false);
    socket.on('matrix_updated', handleMatrixUpdate);
    socket.on('booking_created', handleMatrixUpdate);
    socket.on('booking_updated', handleMatrixUpdate);
    socket.on('booking_cancelled', handleMatrixUpdate);
    socket.on('early_checkout', handleMatrixUpdate);
    socket.on('room_checked_out', handleMatrixUpdate);
    socket.on('room_cleaned', handleMatrixUpdate);
    socket.on('room_status_changed', handleMatrixUpdate);

    // Fallback poll every 20 seconds for non-socket environments
    const pollTimer = setInterval(() => loadMatrixData(false), 20000);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('matrix_updated', handleMatrixUpdate);
      socket.off('booking_created', handleMatrixUpdate);
      socket.off('booking_updated', handleMatrixUpdate);
      socket.off('booking_cancelled', handleMatrixUpdate);
      socket.off('early_checkout', handleMatrixUpdate);
      socket.off('room_checked_out', handleMatrixUpdate);
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
    setActiveTab('onspot');
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
              onClick={() => setActiveTab('matrix')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                activeTab === 'matrix' ? 'bg-[#FDE68A]/60 text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span className="text-[10px]">Rooms (9)</span>
            </button>

            <button
              onClick={() => setActiveTab('onspot')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                activeTab === 'onspot' ? 'bg-[#FDE68A]/60 text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span className="text-[10px]">Spot Book</span>
            </button>

            <button
              onClick={() => setActiveTab('pool')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                activeTab === 'pool' ? 'bg-[#FDE68A]/60 text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Waves className="w-4 h-4" />
              <span className="text-[10px]">Pool Pass</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                activeTab === 'reports' ? 'bg-[#FDE68A]/60 text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px]">Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
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
