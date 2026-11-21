import React, { useState } from 'react';
import { 
  BedDouble, CheckCircle2, Clock, User, Phone, 
  ShieldCheck, ArrowRight, RefreshCw, LogOut, 
  AlertTriangle, Sparkles, Wrench, Wind, Ban
} from 'lucide-react';

const STATUS_CONFIG = {
  'Available': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Vacant' },
  'Reserved':  { color: 'bg-blue-50 text-blue-700 border-blue-200',   dot: 'bg-blue-500',    label: 'Reserved' },
  'Occupied':  { color: 'bg-red-50 text-red-600 border-red-200',     dot: 'bg-red-500',     label: 'Occupied' },
  'Cleaning':  { color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500',   label: 'Cleaning' },
  'Under Maintenance': { color: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-500', label: 'Maintenance' },
};

export default function RoomMatrixView({ rooms, loading, onRefresh, onSelectRoomForBooking, onEarlyCheckout, onCompleteCleaning, onUpdateRoomStatus }) {
  const [filter, setFilter] = useState('all');
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [checkoutTime, setCheckoutTime] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  const filteredRooms = (rooms || []).filter(room => {
    if (filter === 'available') return room.status === 'Available';
    if (filter === 'occupied') return room.status === 'Occupied' || room.status === 'Reserved';
    return true;
  });

  const counts = {
    available: (rooms || []).filter(r => r.status === 'Available').length,
    occupied:  (rooms || []).filter(r => r.status === 'Occupied' || r.status === 'Reserved').length,
    cleaning:  (rooms || []).filter(r => r.status === 'Cleaning').length,
    maintenance: (rooms || []).filter(r => r.status === 'Under Maintenance').length,
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutTarget) return;
    setIsProcessing(true);
    try {
      await onEarlyCheckout(checkoutTarget.roomNumber, checkoutTime || undefined);
      setCheckoutTarget(null);
      setCheckoutTime('');
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCleaningComplete = async (roomNumber) => {
    setIsProcessing(true);
    try {
      await onCompleteCleaning(roomNumber);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (roomNumber, newStatus) => {
    setIsProcessing(true);
    try {
      await onUpdateRoomStatus(roomNumber, newStatus);
      setStatusTarget(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3.5">
      
      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
            <BedDouble className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Live Room Floor Matrix (9 Rooms)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Real-time occupancy status, guest details, allotment rates & check-out timings
            </p>
          </div>
        </div>

        {/* 5-State Status Summary Pills */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-center">
            <div className="text-lg font-black text-emerald-700">{counts.available}</div>
            <div className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider">Available</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-center">
            <div className="text-lg font-black text-red-600">{counts.occupied}</div>
            <div className="text-[9px] text-red-600 font-semibold uppercase tracking-wider">Occupied</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center">
            <div className="text-lg font-black text-amber-700">{counts.cleaning}</div>
            <div className="text-[9px] text-amber-600 font-semibold uppercase tracking-wider">Cleaning</div>
          </div>
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-2 text-center">
            <div className="text-lg font-black text-slate-600">{counts.maintenance}</div>
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Maintenance</div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter(filter === 'available' ? 'all' : 'available')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                filter === 'available'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Vacant ({counts.available})</span>
            </button>

            <button
              onClick={() => setFilter(filter === 'occupied' ? 'all' : 'occupied')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                filter === 'occupied'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-400/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Occupied ({counts.occupied})</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Room Cards Stack */}
      <div className="space-y-3">
        {filteredRooms.map((room) => {
          const status = room.status || 'Available';
          const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Available'];
          const isOccupied = status === 'Occupied' || status === 'Reserved';
          const isCleaning = status === 'Cleaning';
          const isMaintenance = status === 'Under Maintenance';
          const occ = room.occupant;

          return (
            <div
              key={room.id}
              className={`bg-white rounded-2xl p-4 border transition shadow-xs space-y-3 ${
                isOccupied ? 'border-red-200/70' :
                isCleaning ? 'border-amber-200/70 bg-amber-50/20' :
                isMaintenance ? 'border-slate-300/60 bg-slate-50/40' :
                'border-emerald-200/80 bg-emerald-50/10'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-slate-900">Room {room.roomNumber}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {room.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {room.floor} • Base Rate: ₹{room.basePrice?.toLocaleString()}
                  </p>
                </div>

                {/* 5-State Status Badge */}
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border ${cfg.color}`}>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot} ${isCleaning ? 'animate-pulse' : ''}`} />
                  {cfg.label}
                </div>
              </div>

              {/* OCCUPIED State */}
              {isOccupied && occ ? (
                <div className="space-y-2.5 text-xs">
                  <div className="bg-[#F8F9FA] rounded-xl p-3 border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-amber-600" /> Current In-House Guest
                      </span>
                      <span>{occ.guests} Guests</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{occ.customerName}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono pt-0.5">
                      <span className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Phone className="w-3 h-3 text-emerald-600" /> {occ.phone}
                      </span>
                      <span>
                        {occ.aadhaarNumber && occ.aadhaarNumber !== 'Not Recorded' ? (
                          <span className="text-amber-800 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-600" /> {occ.aadhaarNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400">ID: Not Recorded</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FFFBEB] rounded-xl p-3 border border-[#FDE68A]/80 space-y-1">
                    <div className="text-[10px] text-amber-800 uppercase font-mono font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> Occupied Till (Check-out Time)
                    </div>
                    <p className="text-sm font-extrabold text-amber-950">
                      {occ.occupiedUntil || `${occ.checkOut} ${occ.checkOutTime || '11:00 AM'}`}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Check-in: {occ.checkIn} ({occ.checkInTime || '12:00 PM'})
                    </p>
                  </div>

                  {/* Rate & Payment Status Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-slate-500 text-xs">
                        Rate: <strong className="text-slate-900">₹{occ.allottedRate?.toLocaleString()}</strong> ({occ.paymentMethod})
                      </span>
                      {occ.remainingBalance > 0 && (
                        <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                          ₹{occ.remainingBalance?.toLocaleString()} balance due
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setCheckoutTarget(room)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-xs flex items-center gap-1 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Early Check-Out
                    </button>
                  </div>

                  {/* Change Status: Set to Maintenance */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setStatusTarget(room)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
                    >
                      <Wrench className="w-3 h-3" /> Change Room Status
                    </button>
                  </div>
                </div>

              ) : isCleaning ? (
                /* CLEANING State */
                <div className="space-y-2.5">
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 space-y-1">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Wind className="w-4 h-4 animate-pulse" />
                      <span className="text-xs font-bold">Room is being cleaned by housekeeping</span>
                    </div>
                    <p className="text-[11px] text-amber-600">
                      Room will become available after cleaning is confirmed.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCleaningComplete(room.roomNumber)}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-[0.98]"
                    >
                      {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Housekeeping Done — Mark Available
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setStatusTarget(room)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
                    >
                      <Wrench className="w-3 h-3" /> Set Maintenance
                    </button>
                  </div>
                </div>

              ) : isMaintenance ? (
                /* MAINTENANCE State */
                <div className="space-y-2.5">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-300 space-y-1">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Wrench className="w-4 h-4" />
                      <span className="text-xs font-bold">Under Maintenance / Inspection</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Room is unavailable for booking. Mark Available when ready.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStatusChange(room.roomNumber, 'Available')}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Mark Room as Available
                  </button>
                </div>

              ) : (
                /* AVAILABLE State */
                <div className="pt-1">
                  <button
                    onClick={() => onSelectRoomForBooking(room.roomNumber)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#DFB06C] hover:bg-[#d4a35d] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-[0.98]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Book on Spot (Room {room.roomNumber})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex justify-end mt-1.5">
                    <button
                      onClick={() => handleStatusChange(room.roomNumber, 'Under Maintenance')}
                      className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
                    >
                      <Ban className="w-3 h-3" /> Set Maintenance
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Early Checkout Confirmation Modal */}
      {checkoutTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 text-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Early Check-Out</h3>
                <p className="text-xs text-slate-500">Room {checkoutTarget.roomNumber} ({checkoutTarget.category})</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <p>Guest: <strong className="text-slate-900">{checkoutTarget.occupant?.customerName}</strong></p>
              <p>Phone: <span className="font-mono">{checkoutTarget.occupant?.phone}</span></p>
              <p>Scheduled Check-out: <span className="text-amber-800 font-bold">{checkoutTarget.occupant?.occupiedUntil}</span></p>
              {checkoutTarget.occupant?.remainingBalance > 0 && (
                <p className="text-red-600 font-semibold">Balance Due: ₹{checkoutTarget.occupant.remainingBalance?.toLocaleString()}</p>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Actual Check-out Time (optional)</label>
              <input
                type="time"
                value={checkoutTime}
                onChange={e => setCheckoutTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:border-amber-400 outline-none"
              />
            </div>

            <p className="text-xs text-slate-500">
              After checkout, room will move to <strong>CLEANING</strong> status. Housekeeping must confirm before it becomes available.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setCheckoutTarget(null); setCheckoutTime(''); }}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckout}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center justify-center gap-1"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Room Status Modal */}
      {statusTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xs p-5 text-slate-800 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base">Change Room {statusTarget.roomNumber} Status</h3>
            <div className="space-y-2">
              {['Available', 'Cleaning', 'Under Maintenance'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(statusTarget.roomNumber, s)}
                  disabled={isProcessing}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-left flex items-center gap-2 border transition ${
                    s === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                    s === 'Cleaning' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                    'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    s === 'Available' ? 'bg-emerald-500' :
                    s === 'Cleaning' ? 'bg-amber-500' : 'bg-slate-500'
                  }`} />
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStatusTarget(null)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
