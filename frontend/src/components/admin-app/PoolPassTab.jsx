import React, { useState } from 'react';
import { 
  Waves, Users, Clock, Phone, DollarSign, Check, Printer, 
  MessageCircle, Ticket, AlertCircle, RefreshCw, ArrowRight 
} from 'lucide-react';

export default function PoolPassTab({ onIssuePass }) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    adultCount: 1,
    childCount: 0,
    durationHours: 2,
    customRate: '',
    paymentMethod: 'Cash'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [issuedPass, setIssuedPass] = useState(null);

  const adultRate = 350;
  const childRate = 200;
  const calculatedTotal = (formData.adultCount * adultRate) + (formData.childCount * childRate);
  const finalPrice = formData.customRate !== '' ? Number(formData.customRate) : calculatedTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.phone.trim()) {
      setErrorMessage('Guest contact phone number is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const pass = await onIssuePass({
        customerName: formData.customerName.trim() || 'Guest Swimmer',
        phone: formData.phone.trim(),
        adultCount: Number(formData.adultCount),
        childCount: Number(formData.childCount),
        guestCount: Number(formData.adultCount) + Number(formData.childCount),
        durationHours: Number(formData.durationHours),
        customRate: finalPrice,
        paymentMethod: formData.paymentMethod
      });

      setIssuedPass(pass);
      setFormData({
        customerName: '',
        phone: '',
        adultCount: 1,
        childCount: 0,
        durationHours: 2,
        customRate: '',
        paymentMethod: 'Cash'
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to issue pool pass.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      
      {/* Hero Header Card - Exactly matching right screen in user photo */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-600" />
            FAST-TRACK POS TERMINAL
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Swimming Pool Pass Allotment
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Instant entry passes for pool guests • <strong className="text-emerald-600 font-semibold">No Aadhaar Card Required</strong>
          </p>
        </div>

        {/* Standard Pass Rate Pill */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
            STANDARD PASS RATE
          </span>
          <span className="text-sm font-bold text-slate-900 mt-0.5 block">
            ₹350 / Adult • ₹200 / Child
          </span>
        </div>
      </div>

      {/* Main Pass Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Number of Guests - Exactly matching user screenshot */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-600" />
            1. NUMBER OF GUESTS (SWIMMERS)
          </label>

          <div className="space-y-2.5">
            
            {/* Adults Counter Row */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Adults</p>
                <p className="text-xs text-slate-500">₹350 per ticket</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, adultCount: Math.max(0, formData.adultCount - 1) })}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-center transition shadow-2xs"
                >
                  -
                </button>
                <span className="text-base font-black text-slate-900 w-5 text-center">
                  {formData.adultCount}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, adultCount: formData.adultCount + 1 })}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-center transition shadow-2xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children Counter Row */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Children (Below 12)</p>
                <p className="text-xs text-slate-500">₹200 per ticket</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, childCount: Math.max(0, formData.childCount - 1) })}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-center transition shadow-2xs"
                >
                  -
                </button>
                <span className="text-base font-black text-slate-900 w-5 text-center">
                  {formData.childCount}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, childCount: formData.childCount + 1 })}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-center transition shadow-2xs"
                >
                  +
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Duration - Exactly matching user screenshot */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-600" />
            2. FOR HOW MUCH TIME (DURATION)
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { hours: 1, label: '1 Hour' },
              { hours: 2, label: '2 Hours' },
              { hours: 3, label: '3 Hours' }
            ].map((slot) => {
              const isSelected = Number(formData.durationHours) === slot.hours;
              return (
                <button
                  key={slot.hours}
                  type="button"
                  onClick={() => setFormData({ ...formData, durationHours: slot.hours })}
                  className={`py-2.5 px-3 rounded-xl text-center text-xs font-bold transition ${
                    isSelected
                      ? 'bg-[#1E293B] text-white border-2 border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Contact & Pricing */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-cyan-600" />
            3. CONTACT MOBILE NO. & PAYMENT
          </label>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Guest Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 98220 11223"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Payment Mode</label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white outline-none"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="UPI (GPay / PhonePe / QR)">UPI (QR Code)</option>
                  <option value="Debit / Credit Card">Card (POS)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  placeholder={calculatedTotal}
                  value={formData.customRate}
                  onChange={e => setFormData({ ...formData, customRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit: Proceed to Pay Button - Exactly matching screenshot */}
        <button
          type="submit"
          disabled={isSubmitting || (formData.adultCount + formData.childCount === 0)}
          className="w-full py-3.5 px-4 rounded-xl bg-[#1E293B] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
        >
          {isSubmitting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Ticket className="w-4 h-4" />
          )}
          <span>Proceed to Pay (₹{finalPrice.toLocaleString()}) →</span>
        </button>

      </form>

      {/* Issued Pass Modal */}
      {issuedPass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 text-slate-800 space-y-3.5 shadow-xl">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto border border-cyan-200">
                <Waves className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Swimming Pool Pass Issued!</h3>
              <p className="text-xs text-cyan-700 font-mono font-bold">PASS #{issuedPass.id}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Swimmers:</span>
                <span className="font-bold text-slate-900">{issuedPass.totalVisitors} Guests ({issuedPass.adultCount}A, {issuedPass.childCount}C)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Phone:</span>
                <span className="font-mono text-slate-900 font-bold">{issuedPass.phone}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">Entry Time:</span>
                <span className="font-semibold text-slate-900">{issuedPass.entryTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Valid Till:</span>
                <span className="font-bold text-amber-800">{issuedPass.validUntil} ({issuedPass.durationHours} Hours)</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-700 text-sm">₹{issuedPass.totalAmount} ({issuedPass.paymentMethod})</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <a
                  href={`https://wa.me/91${issuedPass.phone?.replace(/[^0-9]/g, '')}?text=Shri%20Sadguru%20Resort%20Pool%20Pass%20%23${issuedPass.id}:%20${issuedPass.totalVisitors}%20Guests.%20Valid%20until%20${encodeURIComponent(issuedPass.validUntil)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Pass
                </a>
              </div>
              <button
                type="button"
                onClick={() => setIssuedPass(null)}
                className="w-full py-2.5 rounded-xl bg-[#DFB06C] hover:bg-[#d4a35d] text-slate-950 font-bold text-xs"
              >
                Close / Next Pass
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
