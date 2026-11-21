import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, CheckCircle2, ShieldCheck, Calendar, Users, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function PackageBookingModal({ isOpen, onClose, selectedPackage }) {
  const today = new Date().toISOString().split('T')[0];

  const [preferredDate, setPreferredDate] = useState(today);
  const [guests, setGuests] = useState('2');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!isOpen || !selectedPackage) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.bookPackage({
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        customerName,
        phone,
        email,
        preferredDate,
        guests,
        totalAmount: selectedPackage.price,
        notes
      });
      setConfirmedBooking(res.booking);
      confetti({ particleCount: 70, spread: 60 });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to book package.');
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
            <Sparkles className="w-5 h-5 text-resort-gold" />
            <span className="font-display font-bold text-sm tracking-widest text-resort-gold uppercase">
              {selectedPackage.name}
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
                <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block mb-1">
                  Package Reservation
                </span>
                <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
                  {selectedPackage.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Rate: ₹{selectedPackage.price.toLocaleString('en-IN')} • {selectedPackage.duration}
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
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={today}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                      Number of Guests *
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                    >
                      <option value="2">2 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="6">6 Guests</option>
                      <option value="10">10 Guests</option>
                      <option value="20">20+ Guests</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                      Primary Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Deshpande"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                      Contact Phone *
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

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                    Special Inclusions / Custom Preferences
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Food preferences, check-in timings, decoration..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl p-2.5 focus:outline-none focus:border-resort-gold"
                  />
                </div>

                <div className="pt-3 border-t border-resort-beigeDark flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Total Package Value</span>
                    <span className="font-display font-bold text-xl text-resort-oliveDeep">
                      ₹{selectedPackage.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:shadow-gold-glow flex items-center gap-2"
                  >
                    {loading ? <span>Confirming...</span> : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Reserve Package</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center space-y-5 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold block">
                  Package Reserved
                </span>
                <h3 className="font-display text-2xl font-bold text-resort-oliveDeep mt-1">
                  We look forward to welcoming you!
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-emerald-200 pb-2">
                  <span className="text-gray-500">Package Booking ID:</span>
                  <strong className="font-mono text-emerald-900">{confirmedBooking.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Package:</span>
                  <strong className="text-gray-800">{confirmedBooking.packageName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Preferred Date:</span>
                  <strong className="text-gray-800">{confirmedBooking.preferredDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Guests:</span>
                  <strong className="text-gray-800">{confirmedBooking.guests} Guests</strong>
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
