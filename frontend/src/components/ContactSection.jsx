import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Room & Event Booking Inquiry',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.submitContact(formData);
      setSuccessMsg(res.message || 'Inquiry received! We will contact you shortly.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'Room & Event Booking Inquiry',
        message: ''
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit inquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-resort-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-semibold block">
            Reservation Assistance & Enquiries
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-resort-oliveDeep">
            Connect with Sadguru Resort
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-gray-600">
            Our reservation and concierge team is available round-the-clock to assist with room selections, event dates, and customized packages.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Quick Channels & Info (5 cols) */}
          <div className="lg:col-span-5 bg-resort-oliveDeep text-resort-cream p-8 sm:p-10 rounded-3xl shadow-luxury-lg space-y-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-resort-gold/10 pointer-events-none" />

            <div className="space-y-6">
              <div>
                <span className="font-display uppercase text-xs tracking-widest text-resort-gold font-bold block mb-1">
                  Direct Concierge
                </span>
                <h3 className="font-display text-2xl font-bold text-white">
                  We are Here for You
                </h3>
              </div>

              {/* Call */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-resort-gold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                    Reservation Hotline
                  </span>
                  <a href="tel:+919822011223" className="text-sm font-bold text-white hover:text-resort-gold transition-colors block">
                    +91 98220 11223
                  </a>
                  <a href="tel:+919422144556" className="text-xs text-gray-300 hover:text-resort-gold transition-colors block">
                    +91 94221 44556
                  </a>
                </div>
              </div>

              {/* WhatsApp Button */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                    Instant WhatsApp Support
                  </span>
                  <a
                    href="https://wa.me/919822011223?text=Hello%20Sadguru%20Resort,%20I%20am%20inquiring%20about%20booking%20rooms/events."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-400 hover:underline"
                  >
                    <span>Chat on WhatsApp (+91 98220 11223)</span>
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-resort-gold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                    Official Email
                  </span>
                  <a href="mailto:contact@sadgururesort.com" className="text-xs font-medium text-white hover:text-resort-gold transition-colors">
                    contact@sadgururesort.com
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-resort-gold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                    Resort Address
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Near Dnyaneshwar Mandir, Jalamb Road, Shegaon - 444203, Dist. Buldhana, Maharashtra, India
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-[11px] text-gray-400">
              Check-in: 01:00 PM • Check-out: 11:00 AM • Swimming Pool: 06:00 AM – 09:00 PM
            </div>
          </div>

          {/* Contact Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-resort-beigeDark/80 shadow-luxury space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block mb-1">
                Drop Us a Message
              </span>
              <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
                Inquire or Request a Custom Proposal
              </h3>
            </div>

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shrikant Joshi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
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
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="shrikant@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                  >
                    <option value="Room & Stay Booking">Room & Stay Booking (9 Rooms)</option>
                    <option value="Banquet Hall Wedding Function">Banquet Hall Wedding Function</option>
                    <option value="Green Lawn Event">Green Lawn Event</option>
                    <option value="Swimming Pool Day Passes">Swimming Pool Day Passes</option>
                    <option value="Corporate Offsite Package">Corporate Offsite Package</option>
                    <option value="Other Inquiries">Other Inquiries</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Message / Special Requirements *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Tell us about your expected dates, number of guests, or special requests..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl p-3 focus:outline-none focus:border-resort-gold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:shadow-gold-glow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <span>Sending Message...</span> : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry to Concierge</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
