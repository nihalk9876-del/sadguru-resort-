import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Users, BedDouble, ShieldCheck, CheckCircle2, 
  CreditCard, ChevronRight, ChevronLeft, Printer, Download, Sparkles, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function BookingModal({ isOpen, onClose, initialRoom, initialDates }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [step, setStep] = useState(1); // 1: Dates & Room, 2: Guest Details & Addons, 3: Review & Payment, 4: Success
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [checkIn, setCheckIn] = useState(initialDates?.checkIn || today);
  const [checkOut, setCheckOut] = useState(initialDates?.checkOut || tomorrow);
  const [category, setCategory] = useState(initialRoom?.category || 'Deluxe AC');
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoom?.id || '');
  const [guests, setGuests] = useState(initialDates?.guests || '2');

  // Guest Details
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [addOnCandlelight, setAddOnCandlelight] = useState(false);
  const [addOnPickup, setAddOnPickup] = useState(false);

  // Payment State
  const [paymentOption, setPaymentOption] = useState('full'); // 'full', 'advance', 'resort'
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');

  // Confirmed Booking Output
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Available candidate rooms for the dates
  const [candidateRooms, setCandidateRooms] = useState([]);
  const [checkingAvail, setCheckingAvail] = useState(false);

  useEffect(() => {
    if (initialRoom) {
      setSelectedRoomId(initialRoom.id);
      setCategory(initialRoom.category);
    }
  }, [initialRoom]);

  // Check real-time available rooms whenever dates or category changes
  useEffect(() => {
    if (!isOpen) return;
    const fetchAvailability = async () => {
      setCheckingAvail(true);
      setErrorMsg('');
      try {
        const res = await api.checkAvailability({
          checkIn,
          checkOut,
          category
        });
        setCandidateRooms(res.availableRooms || []);
        if (res.availableRooms && res.availableRooms.length > 0) {
          // If previously selected room is not available, default to first available
          const isStillAvail = res.availableRooms.some(r => r.id === selectedRoomId);
          if (!isStillAvail) {
            setSelectedRoomId(res.availableRooms[0].id);
          }
        } else {
          setSelectedRoomId('');
        }
      } catch (err) {
        console.error('Availability check failed:', err);
      } finally {
        setCheckingAvail(false);
      }
    };

    if (checkIn && checkOut && new Date(checkIn) < new Date(checkOut)) {
      fetchAvailability();
    }
  }, [isOpen, checkIn, checkOut, category]);

  if (!isOpen) return null;

  // Pricing calculations
  const calculateNights = () => {
    const s = new Date(checkIn).getTime();
    const e = new Date(checkOut).getTime();
    const diff = Math.max(0, e - s);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const getBaseRate = () => {
    if (initialRoom?.price) return initialRoom.price;
    if (category === 'AC Deluxe Room') return 2999;
    if (category === 'AC Deluxe Room with Swimming Pool') return 3499;
    if (category === 'AC Double Deluxe Room (Family)') return 4999;
    if (category === 'AC Double Deluxe Room with Swimming Pool') return 5499;
    if (category.toLowerCase().includes('family') || category.toLowerCase().includes('double')) return 4999;
    return 2999;
  };
  const nightlyRate = getBaseRate();
  const roomSubtotal = nightlyRate * nights;
  const addOnsTotal = (addOnCandlelight ? 1499 : 0) + (addOnPickup ? 800 : 0);
  const taxAmount = Math.round((roomSubtotal + addOnsTotal) * 0.12);
  const grandTotal = roomSubtotal + addOnsTotal + taxAmount;
  const advanceAmount = Math.round(grandTotal * 0.30); // 30% advance option

  const handleProceedToStep2 = () => {
    if (!checkIn || !checkOut) {
      setErrorMsg('Please select both check-in and check-out dates.');
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      setErrorMsg('Check-out date must be after check-in date.');
      return;
    }
    if (candidateRooms.length === 0) {
      setErrorMsg('This room category is fully booked for the selected dates. Please try different dates.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleProceedToStep3 = (e) => {
    e.preventDefault();
    if (!customerName || !phone || !email) {
      setErrorMsg('Name, mobile phone, and email are required.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleFinalBooking = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const advancePaid = paymentOption === 'full' 
        ? grandTotal 
        : paymentOption === 'advance' 
        ? advanceAmount 
        : 0;

      const payload = {
        category,
        customPrice: nightlyRate,
        price: nightlyRate,
        customerName,
        phone,
        email,
        address,
        checkIn,
        checkOut,
        guests: Number(guests),
        advancePaid,
        paymentMethod: paymentOption === 'resort' ? 'Pay at Resort Check-In' : paymentMethod,
        specialRequests: `${specialRequests}${addOnCandlelight ? ' [Add-on: Candlelight Dinner]' : ''}${addOnPickup ? ' [Add-on: Station Pickup]' : ''}`
      };

      const res = await api.createBooking(payload);
      setConfirmedBooking(res.booking);
      setStep(4);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setErrorMsg(err.message || 'Booking conflict: room might have been taken. Please re-check dates.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-resort-beigeDark overflow-hidden relative text-resort-charcoal"
      >
        {/* Modal Top Bar */}
        <div className="bg-resort-oliveDeep text-resort-cream px-6 py-4 flex items-center justify-between border-b border-resort-gold/30">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-sm tracking-widest text-resort-gold uppercase">
              Sadguru Resort
            </span>
            <span className="text-gray-400 text-xs">• Reservation Desk</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper */}
        {step < 4 && (
          <div className="bg-resort-cream px-6 py-3 border-b border-resort-beigeDark flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 1 ? 'gold-gradient-bg text-resort-oliveDeep' : 'bg-gray-200 text-gray-500'
              }`}>1</span>
              <span className={step === 1 ? 'font-bold text-resort-oliveDeep' : 'text-gray-500'}>
                Dates & Suite
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 2 ? 'gold-gradient-bg text-resort-oliveDeep' : 'bg-gray-200 text-gray-500'
              }`}>2</span>
              <span className={step === 2 ? 'font-bold text-resort-oliveDeep' : 'text-gray-500'}>
                Guest Details
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 3 ? 'gold-gradient-bg text-resort-oliveDeep' : 'bg-gray-200 text-gray-500'
              }`}>3</span>
              <span className={step === 3 ? 'font-bold text-resort-oliveDeep' : 'text-gray-500'}>
                Payment & Confirm
              </span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: DATES & ROOM SELECTION */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
                Select Stay Dates & Suite
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time calendar verification prevents date collisions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Room Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                >
                  <option value="AC Deluxe Room">1) AC Deluxe Room (₹2,999/night)</option>
                  <option value="AC Deluxe Room with Swimming Pool">2) AC Deluxe Room with Swimming Pool (₹3,499/night)</option>
                  <option value="AC Double Deluxe Room (Family)">3) AC Double Deluxe Room (Family) (₹4,999/night)</option>
                  <option value="AC Double Deluxe Room with Swimming Pool">4) AC Double Deluxe Room with Swimming Pool (₹5,499/night)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Total Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5 Guests</option>
                  <option value="6">6 Guests</option>
                </select>
              </div>
            </div>

            {/* Category Availability Status (Never shows individual room numbers to guests) */}
            <div className="p-4 rounded-2xl bg-resort-cream border border-resort-beigeDark space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-resort-oliveDeep flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-resort-gold" />
                  Category Live Availability:
                </span>
                {checkingAvail ? (
                  <span className="text-gray-500 animate-pulse text-xs">Checking database...</span>
                ) : candidateRooms.length > 0 ? (
                  <span className="font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Available on Selected Dates
                  </span>
                ) : (
                  <span className="font-bold text-rose-800 bg-rose-100 border border-rose-300 px-3 py-1 rounded-full text-xs">
                    Sold Out on Selected Dates
                  </span>
                )}
              </div>

              {candidateRooms.length > 0 ? (
                <div className="text-xs text-gray-700 bg-white/90 p-3 rounded-xl border border-resort-beigeDark/70 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-resort-oliveDeep block text-sm">{category}</span>
                    <span className="text-[11px] text-gray-500">
                      ✦ Room is automatically alloted upon booking confirmation
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-bold text-base text-resort-gold block">
                      ₹{nightlyRate.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-500">per night</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                  This room category is fully booked for the selected dates. Please adjust your stay dates or choose another category.
                </div>
              )}
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-resort-beigeDark">
              <div className="text-xs text-gray-500">
                Duration: <strong className="text-resort-oliveDeep">{nights} night(s)</strong>
              </div>
              <button
                type="button"
                onClick={handleProceedToStep2}
                disabled={candidateRooms.length === 0}
                className={`py-3 px-8 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 ${
                  candidateRooms.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'gold-gradient-bg text-resort-oliveDeep hover:shadow-gold-glow'
                }`}
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GUEST DETAILS & ADDONS */}
        {step === 2 && (
          <form onSubmit={handleProceedToStep3} className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
                Guest Information & Extras
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Please provide your contact information for reservation confirmation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kulkarni"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Mobile Phone Number *
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="anand@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  City / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Maharashtra"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>
            </div>

            {/* Optional Luxury Add-ons */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-resort-gold font-bold block">
                Enhance Your Stay (Optional Add-ons)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3 rounded-xl border border-resort-beigeDark bg-resort-cream flex items-center justify-between text-xs cursor-pointer hover:border-resort-gold">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addOnCandlelight}
                      onChange={(e) => setAddOnCandlelight(e.target.checked)}
                      className="accent-resort-gold"
                    />
                    <span>Poolside Candlelight Dinner</span>
                  </div>
                  <strong className="text-resort-gold">+₹1,499</strong>
                </label>

                <label className="p-3 rounded-xl border border-resort-beigeDark bg-resort-cream flex items-center justify-between text-xs cursor-pointer hover:border-resort-gold">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addOnPickup}
                      onChange={(e) => setAddOnPickup(e.target.checked)}
                      className="accent-resort-gold"
                    />
                    <span>Shegaon Railway Station Cab</span>
                  </div>
                  <strong className="text-resort-gold">+₹800</strong>
                </label>
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                Special Requests
              </label>
              <textarea
                rows="2"
                placeholder="Upper floor, extra beddings, late arrival..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl p-2.5 focus:outline-none focus:border-resort-gold"
              />
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-resort-beigeDark">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl border border-resort-beigeDark text-gray-600 font-semibold text-xs flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="py-3 px-8 rounded-xl font-bold text-xs uppercase tracking-widest gold-gradient-bg text-resort-oliveDeep hover:shadow-gold-glow flex items-center gap-2"
              >
                <span>Review & Pay</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: REVIEW & PAYMENT SIMULATION */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
                Reservation Summary & Payment
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Review your reservation details before final confirmation.
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-resort-cream border border-resort-beigeDark space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-resort-beigeDark/60">
                <span className="text-gray-500">Selected Accommodation:</span>
                <span className="font-bold text-resort-oliveDeep">
                  {category}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-resort-beigeDark/60">
                <span className="text-gray-500">Dates & Duration:</span>
                <span className="font-bold text-resort-oliveDeep">
                  {checkIn} to {checkOut} ({nights} night{nights > 1 ? 's' : ''})
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-resort-beigeDark/60">
                <span className="text-gray-500">Guest Name & Mobile:</span>
                <span className="font-bold text-resort-oliveDeep">
                  {customerName} ({phone})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Room Base Rate ({nights} nights):</span>
                <span>₹{roomSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {addOnsTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Add-ons Total:</span>
                  <span>₹{addOnsTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Resort GST (12%):</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-resort-beigeDark text-sm font-bold text-resort-oliveDeep">
                <span>Grand Total Amount:</span>
                <span className="text-resort-gold">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-resort-gold font-bold block">
                Select Payment Mode
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between ${
                  paymentOption === 'full' ? 'border-resort-gold bg-resort-gold/10 font-bold' : 'border-resort-beigeDark bg-white'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === 'full'}
                      onChange={() => setPaymentOption('full')}
                      className="accent-resort-gold"
                    />
                    <span>Full Payment</span>
                  </div>
                  <strong className="text-resort-gold text-sm">₹{grandTotal.toLocaleString('en-IN')}</strong>
                </label>

                <label className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between ${
                  paymentOption === 'advance' ? 'border-resort-gold bg-resort-gold/10 font-bold' : 'border-resort-beigeDark bg-white'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === 'advance'}
                      onChange={() => setPaymentOption('advance')}
                      className="accent-resort-gold"
                    />
                    <span>30% Advance</span>
                  </div>
                  <strong className="text-resort-gold text-sm">₹{advanceAmount.toLocaleString('en-IN')}</strong>
                </label>

                <label className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between ${
                  paymentOption === 'resort' ? 'border-resort-gold bg-resort-gold/10 font-bold' : 'border-resort-beigeDark bg-white'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === 'resort'}
                      onChange={() => setPaymentOption('resort')}
                      className="accent-resort-gold"
                    />
                    <span>Pay at Resort</span>
                  </div>
                  <strong className="text-gray-500 text-xs">At Check-in Desk</strong>
                </label>
              </div>

              {paymentOption !== 'resort' && (
                <div className="pt-2">
                  <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                    Payment Gateway Channel
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2 focus:outline-none focus:border-resort-gold"
                  >
                    <option value="UPI / QR Code">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="Credit / Debit Card">Credit / Debit Card (Visa / Mastercard)</option>
                    <option value="Net Banking">Net Banking (HDFC / SBI / ICICI)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Step 3 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-resort-beigeDark">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 rounded-xl border border-resort-beigeDark text-gray-600 font-semibold text-xs flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleFinalBooking}
                className="py-3 px-8 rounded-xl font-bold text-xs uppercase tracking-widest gold-gradient-bg text-resort-oliveDeep hover:shadow-gold-glow flex items-center gap-2"
              >
                {loading ? <span>Locking Room...</span> : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Pay Reservation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION RECEIPT */}
        {step === 4 && confirmedBooking && (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block">
                Booking Confirmed!
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-resort-oliveDeep mt-1">
                Your Sanctuary Awaits
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                A booking confirmation and digital receipt have been generated in the system.
              </p>
            </div>

            {/* Printable Digital Receipt Card */}
            <div className="bg-resort-cream border-2 border-dashed border-resort-gold/60 p-5 rounded-2xl text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-resort-beigeDark">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Booking ID</span>
                  <span className="font-mono font-bold text-sm text-resort-oliveDeep">
                    {confirmedBooking.id}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  {confirmedBooking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-1">
                <div>
                  <span className="text-gray-500 block text-[11px]">Guest Name:</span>
                  <strong className="text-resort-oliveDeep">{confirmedBooking.customerName}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Contact Phone:</span>
                  <strong className="text-resort-oliveDeep">{confirmedBooking.phone}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Room Allocated:</span>
                  <strong className="text-resort-oliveDeep">Room {confirmedBooking.roomNumber} ({confirmedBooking.category})</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Stay Dates:</span>
                  <strong className="text-resort-oliveDeep">{confirmedBooking.checkIn} to {confirmedBooking.checkOut}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Amount Paid:</span>
                  <strong className="text-emerald-700">₹{confirmedBooking.advancePaid?.toLocaleString('en-IN')} ({confirmedBooking.paymentStatus})</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Pool Access:</span>
                  <strong className="text-cyan-700">100% Free Complimentary</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-resort-beigeDark hover:border-resort-gold text-xs font-semibold text-resort-charcoal flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-resort-gold" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-8 rounded-xl gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-wider hover:shadow-gold-glow"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
