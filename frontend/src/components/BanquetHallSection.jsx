import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Users, Sparkles, Calendar, Clock, CheckCircle2, Send, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function BanquetHallSection({ onEventBooked }) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    date: '',
    timeSlot: 'Evening (05:00 PM - 11:00 PM)',
    eventType: 'Wedding Functions',
    guestCount: '250',
    requirements: 'Stage decoration, audio-visual setup, and gourmet catering buffet.'
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const occasions = [
    { title: 'Wedding Functions', desc: 'Grand royal stage, bride & groom entry aisles, and mandap space.' },
    { title: 'Engagement Ceremonies', desc: 'Intimate, grand celebration with ring ceremony stage & photography backdrops.' },
    { title: 'Birthday Parties', desc: 'Lively celebrations with themed lighting, DJ sound setup, and cake podium.' },
    { title: 'Corporate Events', desc: 'Annual general meetings, leadership retreats, product releases & conferences.' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await api.createBanquetBooking(formData);
      setConfirmedBooking(res.booking);
      setStatusMessage({ type: 'success', text: 'Banquet Hall reservation successfully recorded!' });
      if (onEventBooked) onEventBooked(res.booking);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Unable to book banquet hall for this date.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="banquet" className="py-24 bg-resort-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading as requested */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-semibold block">
            Royal Celebrations & Events
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-resort-oliveDeep">
            Celebrate Your Special Moments
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-gray-600">
            A majestic 500+ capacity, fully air-conditioned, pillarless grand hall designed for royal weddings, memorable engagements, birthdays, and elite corporate gatherings.
          </p>
        </div>

        {/* Gallery & Specs row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          
          {/* Visual Showcase (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-luxury-lg border-4 border-white group">
              <img
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"
                alt="Sadguru Banquet Hall"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-resort-oliveDeep/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs uppercase tracking-widest text-resort-gold block">
                  Pillarless Grand Ballroom
                </span>
                <p className="font-display text-2xl font-bold">Up to 500 Guests Capacity</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="h-28 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80"
                  alt="Banquet Seating"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-28 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80"
                  alt="Stage Lighting"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-28 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80"
                  alt="Catering Setup"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Suitable Occasions Grid (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block mb-1">
                Bespoke Arrangements
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-resort-oliveDeep">
                Designed for Life's Greatest Milestones
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {occasions.map((occ, i) => (
                <div key={i} className="p-4 rounded-2xl bg-resort-creamDark/60 border border-resort-beigeDark hover:border-resort-gold transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-resort-gold" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-resort-oliveDeep">
                      {occ.title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {occ.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Hall Key Specifications */}
            <div className="p-5 rounded-2xl bg-white border border-resort-beigeDark shadow-sm space-y-2">
              <span className="text-xs uppercase tracking-wider text-resort-gold font-bold block">
                Hall Amenities & Equipment
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Central Air Conditioning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>JBL Pro Sound & Mics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% DG Power Backup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bridal Green Room Attached</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Dedicated Banquet Hall Booking Enquiry Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-luxury border border-resort-beigeDark/80 max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block">
              Reservation & Availability Request
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-resort-oliveDeep mt-1">
              Check Dates & Reserve Banquet Hall
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Select your preferred date and slot. Our automated calendar checks for date conflicts instantly.
            </p>
          </div>

          {statusMessage && (
            <div className={`p-4 rounded-xl text-xs font-semibold mb-6 flex items-center justify-between ${
              statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <span>{statusMessage.text}</span>
              {confirmedBooking && (
                <span className="font-mono text-resort-oliveDeep bg-white px-2.5 py-1 rounded-md border">
                  ID: {confirmedBooking.id}
                </span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98220 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="ramesh@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Time Slot *
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                >
                  <option value="Morning (09:00 AM - 03:00 PM)">Morning (09:00 AM - 03:00 PM)</option>
                  <option value="Evening (05:00 PM - 11:00 PM)">Evening (05:00 PM - 11:00 PM)</option>
                  <option value="Full Day">Full Day (All Day Exclusive)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Occasion Type *
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                >
                  <option value="Wedding Functions">Wedding Function</option>
                  <option value="Engagement Ceremonies">Engagement Ceremony</option>
                  <option value="Birthday Parties">Birthday Party</option>
                  <option value="Corporate Events">Corporate Event / Meeting</option>
                  <option value="Anniversary Celebration">Anniversary Celebration</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Expected Guests *
                </label>
                <select
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                >
                  <option value="100">Up to 100 Guests</option>
                  <option value="200">100 - 200 Guests</option>
                  <option value="350">200 - 350 Guests</option>
                  <option value="500">350 - 500 Guests</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                Specific Setup & Food Catering Notes
              </label>
              <textarea
                rows="2"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Mention stage preferences, vegetarian catering menu, sound requirements..."
                className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl p-3 focus:outline-none focus:border-resort-gold"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 italic">
                * Concurrency protected: booked slots are instantly reserved in the database.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-xl hover:shadow-gold-glow hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                {loading ? <span>Verifying Slot...</span> : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit & Reserve Banquet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </section>
  );
}
