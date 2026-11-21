import React, { useState, useEffect } from 'react';
import { 
  Camera, Check, ShieldCheck, User, Phone, Hash, Calendar, 
  Clock, DollarSign, BedDouble, AlertCircle, Sparkles, Printer, 
  MessageCircle, ArrowRight, RefreshCw, X, Download
} from 'lucide-react';
import AadhaarScannerModal from './AadhaarScannerModal';
import { generateReceiptPDF, shareReceiptWhatsApp } from '../../utils/pdfReceipt';

export default function OnSpotBookingTab({ rooms, onBookingSuccess, preselectedRoom, onClearPreselectedRoom }) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedBooking, setCompletedBooking] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    roomNumber: preselectedRoom || '',
    customerName: '',
    phone: '',
    aadhaarNumber: '',
    dob: '',
    age: '',
    guests: 2,
    adults: 2,
    children: 0,
    checkInDate: new Date().toISOString().split('T')[0],
    checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    durationPreset: '24', // '12', '24', '48'
    checkOutDate: '',
    checkOutTime: '11:00 AM',
    rate: '',
    advancePaid: '',
    paymentMethod: 'Cash',
    notes: ''
  });

  useEffect(() => {
    if (formData.checkInDate) {
      const d = new Date(formData.checkInDate);
      const hours = Number(formData.durationPreset) || 24;
      const days = Math.max(1, Math.round(hours / 24));
      d.setDate(d.getDate() + days);
      setFormData(prev => ({ ...prev, checkOutDate: d.toISOString().split('T')[0] }));
    }
  }, [formData.checkInDate, formData.durationPreset]);

  useEffect(() => {
    if (preselectedRoom) {
      setFormData(prev => ({ ...prev, roomNumber: preselectedRoom }));
      const r = (rooms || []).find(rm => String(rm.roomNumber) === String(preselectedRoom));
      if (r) {
        setFormData(prev => ({ ...prev, rate: r.basePrice, advancePaid: r.basePrice }));
      }
    }
  }, [preselectedRoom, rooms]);

  const handleAadhaarScanned = (scanned) => {
    setFormData(prev => ({
      ...prev,
      customerName: scanned.customerName || prev.customerName,
      aadhaarNumber: scanned.aadhaarNumber || prev.aadhaarNumber,
      dob: scanned.dob || prev.dob,
      age: scanned.age || prev.age
    }));
  };

  const handleRoomChange = (roomNum) => {
    const selected = (rooms || []).find(r => String(r.roomNumber) === String(roomNum));
    setFormData(prev => ({
      ...prev,
      roomNumber: roomNum,
      rate: selected ? selected.basePrice : prev.rate,
      advancePaid: selected ? selected.basePrice : prev.advancePaid
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.roomNumber) {
      setErrorMessage('Please select a room to allot from the 3x3 grid below.');
      return;
    }
    if (!formData.customerName.trim()) {
      setErrorMessage('Guest name is required (scan Aadhaar or type name).');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Guest contact phone number is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await onBookingSuccess({
        roomNumber: formData.roomNumber,
        customerName: formData.customerName,
        phone: formData.phone,
        aadhaarNumber: formData.aadhaarNumber,
        dob: formData.dob,
        age: formData.age,
        guests: formData.guests,
        adults: formData.adults,
        children: formData.children,
        checkInDate: formData.checkInDate,
        checkInTime: formData.checkInTime,
        checkOutDate: formData.checkOutDate,
        checkOutTime: formData.checkOutTime,
        durationHours: Number(formData.durationPreset) || 24,
        rate: Number(formData.rate) || 0,
        advancePaid: formData.advancePaid !== '' ? Number(formData.advancePaid) : Number(formData.rate),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });

      setCompletedBooking(created);
      if (onClearPreselectedRoom) onClearPreselectedRoom();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete on-spot check-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      
      {/* Hero Header Card - Exactly matching middle screen in user photo */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] block">
            + FRONT DESK WALK-IN
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            On-Spot Room Allotment & Check-In
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Auto-scan Aadhaar card for instant name, age & 12-digit-number extraction
          </p>
        </div>

        {/* Scan Guest Aadhaar Card Button */}
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="w-full py-3.5 px-4 rounded-xl bg-[#DFB06C] hover:bg-[#d4a35d] text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition cursor-pointer"
        >
          <Camera className="w-4 h-4 text-slate-950" />
          <span>Scan Guest Aadhaar Card</span>
        </button>
      </div>

      {/* Auto-Scanned Banner if Aadhaar Scanned */}
      {formData.aadhaarNumber && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{formData.customerName}</p>
              <p className="text-[11px] text-slate-600 font-mono">
                Aadhaar: <span className="font-bold text-amber-800">{formData.aadhaarNumber}</span> • Age: <strong className="text-emerald-700">{formData.age} yrs</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="text-[11px] text-amber-700 font-semibold hover:underline"
          >
            Re-scan
          </button>
        </div>
      )}

      {/* Main Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: 3x3 Room Selection Grid - Exactly matching user screenshot */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-amber-600" />
              1. SELECT ROOM TO ALLOT
            </label>
            <span className="text-[10px] text-slate-500 font-medium">
              Green = Available | Red = Occupied
            </span>
          </div>

          {/* 3x3 Grid of 9 Rooms */}
          <div className="grid grid-cols-3 gap-2.5">
            {(rooms || []).map((r) => {
              const isSelected = String(formData.roomNumber) === String(r.roomNumber);
              const isOccupied = r.isOccupied;

              return (
                <button
                  key={r.id}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => handleRoomChange(r.roomNumber)}
                  className={`py-3 px-2 rounded-xl text-center transition flex flex-col items-center justify-center relative ${
                    isOccupied
                      ? 'bg-slate-50/80 border border-slate-200/60 opacity-70 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#1E293B] text-white border-2 border-slate-900 shadow-md ring-2 ring-slate-900/20'
                      : 'bg-white border border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-mono font-medium ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {r.category.includes('Family') ? 'FAMILY' : 'AC DLX'}
                  </span>
                  
                  <span className={`text-lg font-black my-0.5 ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}>
                    {r.roomNumber}
                  </span>

                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    isOccupied
                      ? 'bg-red-100 text-red-600'
                      : isSelected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isOccupied ? 'BUSY' : 'FREE'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Guest Details Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <User className="w-4 h-4 text-amber-600" />
            2. GUEST INFORMATION (AADHAAR AUTO-FILL)
          </label>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Guest Full Name *</label>
              <input
                type="text"
                required
                placeholder="Auto-fills from Aadhaar scan or enter name"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:border-amber-500 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Mobile Contact Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 98220 11223"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:border-amber-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">12-Digit Aadhaar No.</label>
                <input
                  type="text"
                  placeholder="XXXX XXXX XXXX"
                  value={formData.aadhaarNumber}
                  onChange={e => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-amber-800 font-mono font-bold focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Guest Age</label>
                <input
                  type="number"
                  placeholder="e.g. 34"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Total Guests in Room</label>
              <select
                value={formData.guests}
                onChange={e => setFormData({ ...formData, guests: Number(e.target.value), adults: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-amber-500 outline-none"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests</option>
                <option value={5}>5 Guests</option>
                <option value={6}>6 Guests (Family)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Timing & Rate Details */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            3. TIMING & RATE CHARGED
          </label>

          <div className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Duration Allotment</label>
                <select
                  value={formData.durationPreset}
                  onChange={e => setFormData({ ...formData, durationPreset: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white outline-none"
                >
                  <option value="12">12 Hours (Transit)</option>
                  <option value="24">24 Hours (1 Night)</option>
                  <option value="48">48 Hours (2 Nights)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Room Rate (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3499"
                  value={formData.rate}
                  onChange={e => setFormData({ ...formData, rate: e.target.value, advancePaid: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Check-In Date</label>
                <input
                  type="date"
                  value={formData.checkInDate}
                  onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Occupied Till (Check-Out)</label>
                <input
                  type="date"
                  value={formData.checkOutDate}
                  onChange={e => setFormData({ ...formData, checkOutDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-amber-300 text-amber-900 font-mono font-bold text-xs focus:bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white outline-none"
              >
                <option value="Cash">Cash at Counter</option>
                <option value="UPI (GPay / PhonePe / QR)">UPI (QR Code)</option>
                <option value="Debit / Credit Card">Debit / Credit Card</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.roomNumber}
          className="w-full py-3.5 px-4 rounded-xl bg-[#1E293B] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
        >
          {isSubmitting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>
            {formData.roomNumber ? `Confirm Allotment & Check-In Room ${formData.roomNumber}` : 'Select a Room to Continue'}
          </span>
        </button>

      </form>

      {/* Aadhaar Scanner Modal */}
      <AadhaarScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleAadhaarScanned}
      />

      {/* Booking Success Modal */}
      {completedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 text-slate-800 space-y-3.5 shadow-xl">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Room Allotted Successfully!</h3>
              <p className="text-xs text-emerald-600 font-mono font-semibold">Ref: {completedBooking.id}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Room:</span>
                <span className="font-bold text-slate-900">Room {completedBooking.roomNumber} ({completedBooking.category})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guest:</span>
                <span className="font-semibold text-slate-900">{completedBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aadhaar:</span>
                <span className="font-mono text-amber-800">{completedBooking.aadhaarNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Occupied Till:</span>
                <span className="font-bold text-amber-900">{completedBooking.checkOut} ({completedBooking.checkOutTime || '11:00 AM'})</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-900">₹{completedBooking.totalAmount} ({completedBooking.paymentMethod})</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {/* Financial Summary */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Payable:</span>
                  <span className="font-bold text-slate-900">₹{(completedBooking.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Received ({completedBooking.paymentMethod}):</span>
                  <span className="font-bold text-blue-700">₹{(completedBooking.advancePaid || 0).toLocaleString('en-IN')}</span>
                </div>
                {(completedBooking.remainingBalance || 0) > 0 && (
                  <div className="flex justify-between border-t border-red-100 pt-1 mt-1">
                    <span className="text-red-600 font-semibold">Balance Due:</span>
                    <span className="font-bold text-red-600">₹{completedBooking.remainingBalance.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => generateReceiptPDF(completedBooking, true)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => generateReceiptPDF(completedBooking, false)}
                  className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
              </div>
              <button
                type="button"
                onClick={() => shareReceiptWhatsApp(completedBooking)}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1"
              >
                <MessageCircle className="w-4 h-4" /> Send WhatsApp Receipt
              </button>
              <button
                type="button"
                onClick={() => setCompletedBooking(null)}
                className="w-full py-2.5 rounded-xl bg-[#DFB06C] hover:bg-[#d4a35d] text-slate-950 font-bold text-xs"
              >
                Done / Next Guest
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
