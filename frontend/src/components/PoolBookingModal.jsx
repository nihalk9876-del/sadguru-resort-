import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Waves, Clock, CheckCircle2, ShieldCheck, Calendar, Users, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function PoolBookingModal({ isOpen, onClose }) {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [timeSlot, setTimeSlot] = useState('04:00 PM - 07:00 PM');
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!isOpen) return null;

  const adultRate = 350;
  const childRate = 200;
  const totalAmount = (adultCount * adultRate) + (childCount * childRate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.createPoolBooking({
        customerName,
        phone,
        email,
        date,
        timeSlot,
        adultCount,
        childCount,
        notes
      });
      setConfirmedBooking(res.booking);
      confetti({ particleCount: 70, spread: 60 });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reserve swimming pool slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl max-w-lg w-full my-auto shadow-2xl border border-resort-beigeDark overflow-hidden text-resort-charcoal relative"
      >
        <div className="bg-resort-oliveDeep text-resort-cream px-6 py-4 flex items-center justify-between border-b border-resort-gold/30">
          <div className="flex items-center space-x-2">
            <Waves className="w-5 h-5 text-cyan-400" />
            <span className="font-display font-bold text-sm tracking-widest text-resort-gold uppercase">
              Swimming Pool Pass Reservation
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {!confirmedBooking ? (
            <>
              <div>
                <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
                  Book Swimming Pool Slot
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select your date, preferred slot, and visitor passes.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                      Visit Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                      Time Slot *
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                    >
                      <option value="07:00 AM - 10:00 AM">Morning (07:00 AM - 10:00 AM)</option>
                      <option value="11:00 AM - 02:00 PM">Mid-Day (11:00 AM - 02:00 PM)</option>
                      <option value="04:00 PM - 07:00 PM">Sunset (04:00 PM - 07:00 PM)</option>
                      <option value="07:00 PM - 09:00 PM">Evening (07:00 PM - 09:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-resort-cream border border-resort-beigeDark">
                  <div>
                    <label className="text-[11px] uppercase text-gray-500 font-bold block mb-1">
                      Adults (₹350)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={adultCount}
                      onChange={(e) => setAdultCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-xs font-bold bg-white border border-resort-beigeDark rounded-xl px-3 py-2 focus:outline-none focus:border-resort-gold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase text-gray-500 font-bold block mb-1">
                      Kids (3-10y, ₹200)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={childCount}
                      onChange={(e) => setChildCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-xs font-bold bg-white border border-resort-beigeDark rounded-xl px-3 py-2 focus:outline-none focus:border-resort-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                      Visitor Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nilesh Joshi"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98220 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                    />
                  </div>
                </div>

                {/* Amount preview & CTA */}
                <div className="pt-3 border-t border-resort-beigeDark flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Total Pool Pass Rate</span>
                    <span className="font-display font-bold text-xl text-resort-oliveDeep">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:shadow-gold-glow flex items-center gap-2"
                  >
                    {loading ? <span>Reserving...</span> : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Reserve Slot</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center space-y-5 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-cyan-800 font-bold block">
                  Pool Pass Confirmed
                </span>
                <h3 className="font-display text-2xl font-bold text-resort-oliveDeep mt-1">
                  Ready for a Refreshing Dip!
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-cyan-200 pb-2">
                  <span className="text-gray-500">Booking Pass ID:</span>
                  <strong className="font-mono text-cyan-900">{confirmedBooking.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled Date:</span>
                  <strong className="text-gray-800">{confirmedBooking.date}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time Slot:</span>
                  <strong className="text-gray-800">{confirmedBooking.timeSlot}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Visitors:</span>
                  <strong className="text-gray-800">
                    {confirmedBooking.adultCount} Adult(s), {confirmedBooking.childCount} Child(ren)
                  </strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-cyan-200 font-bold">
                  <span>Pass Total:</span>
                  <span className="text-cyan-900">₹{confirmedBooking.totalAmount}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-wider hover:shadow-gold-glow"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
