import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, CheckCircle2, AlertCircle, Printer, XCircle, Calendar, BedDouble, Phone } from 'lucide-react';
import { api } from '../services/api';

export default function TrackBookingModal({ isOpen, onClose }) {
  const [bookingId, setBookingId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setBooking(null);

    try {
      const res = await api.trackBooking(bookingId.trim(), phone.trim());
      setBooking(res.booking);
    } catch (err) {
      setErrorMsg(err.message || 'No matching booking found. Please check your Booking ID and Phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel booking ${booking.id}? This will immediately release the room inventory back to the resort.`
    );
    if (!confirmCancel) return;

    setCancelLoading(true);
    setErrorMsg('');
    try {
      const res = await api.cancelBooking(booking.id, 'Cancelled by customer via self-service portal');
      setBooking(res.booking);
      setSuccessMsg('Reservation cancelled successfully. The room inventory has been released.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel reservation.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-resort-beigeDark overflow-hidden relative text-resort-charcoal"
      >
        {/* Header */}
        <div className="bg-resort-oliveDeep text-resort-cream px-6 py-4 flex items-center justify-between border-b border-resort-gold/30">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-sm tracking-widest text-resort-gold uppercase">
              Sadguru Resort
            </span>
            <span className="text-gray-400 text-xs">• Self-Service Reservation Status</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
              Look Up Your Booking
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter your Booking ID (e.g. SR-RM-2026-0101) and registered phone number.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Booking Reference ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SR-RM-2026-0101"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 uppercase focus:outline-none focus:border-resort-gold"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Registered Mobile *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98220 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest py-3 rounded-xl hover:shadow-gold-glow transition-all flex items-center justify-center gap-2"
            >
              {loading ? <span>Searching Records...</span> : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Reservation Status</span>
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success / Info Message */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Found Booking Details */}
          {booking && (
            <div className="bg-resort-cream border border-resort-beigeDark rounded-2xl p-5 space-y-4 animate-fadeIn text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-resort-beigeDark">
                <div>
                  <span className="text-[10px] uppercase text-gray-500 font-semibold block">Booking Reference</span>
                  <span className="font-mono text-sm font-bold text-resort-oliveDeep">{booking.id}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  booking.status === 'Confirmed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : booking.status === 'Cancelled'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  Status: {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-1">
                <div>
                  <span className="text-gray-500 block text-[11px]">Guest Name:</span>
                  <strong className="text-resort-oliveDeep">{booking.customerName}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Phone:</span>
                  <strong className="text-resort-oliveDeep">{booking.phone}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Room Number:</span>
                  <strong className="text-resort-oliveDeep">Room {booking.roomNumber} ({booking.category})</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Guests:</span>
                  <strong className="text-resort-oliveDeep">{booking.guests} Guests</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Check-in Date:</span>
                  <strong className="text-resort-oliveDeep">{booking.checkIn}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Check-out Date:</span>
                  <strong className="text-resort-oliveDeep">{booking.checkOut}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Total Amount:</span>
                  <strong className="text-resort-oliveDeep">₹{booking.totalAmount?.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Payment Status:</span>
                  <strong className="text-emerald-700">{booking.paymentStatus}</strong>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="pt-2 border-t border-resort-beigeDark/60">
                  <span className="text-gray-500 block text-[11px]">Special Requests:</span>
                  <p className="text-gray-700 italic">{booking.specialRequests}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-resort-beigeDark flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2 px-4 rounded-xl border border-resort-beigeDark text-gray-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-white"
                >
                  <Printer className="w-3.5 h-3.5 text-resort-gold" />
                  <span>Print Receipt</span>
                </button>

                {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                  <button
                    type="button"
                    disabled={cancelLoading}
                    onClick={handleCancelBooking}
                    className="py-2 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1.5 border border-red-200"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{cancelLoading ? 'Releasing Room...' : 'Cancel Reservation'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
