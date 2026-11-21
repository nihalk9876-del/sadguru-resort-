import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trees, Camera, Sparkles, Calendar, Users, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function LawnSection({ onEventBooked }) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    date: '',
    eventType: 'Grand Wedding Reception',
    guestCount: '350',
    requirements: 'Fairy lights decor on palms, open buffet counters, and royal stage.'
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const lawnOccasions = [
    { title: 'Wedding Functions', desc: 'Breathtaking open-air wedding mandap under starlit skies with royal aisle pathways.' },
    { title: 'Birthday Celebrations', desc: 'Festive outdoor lawn parties with music, themed illumination, and outdoor barbecue.' },
    { title: 'Parties & Sangeet', desc: 'Spacious dance stage, heavy acoustic sound permissions, and festive lighting.' },
    { title: 'Corporate Gatherings', desc: 'Team bonding activities, cocktail evenings, executive gala dinners, and awards.' },
    { title: 'Photography Events', desc: 'Lush greenery, natural sunlight, palm foliage, and serene architectural corners for pre-wedding & portfolio shoots.' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await api.createLawnBooking(formData);
      setConfirmedBooking(res.booking);
      setStatusMessage({ type: 'success', text: 'Lawn event booked successfully! Your date is blocked.' });
      if (onEventBooked) onEventBooked(res.booking);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Lawn is already booked for this date.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="lawn" className="py-24 bg-resort-creamDark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading as requested */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-semibold block">
            Emerald Outdoor Arenas
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-resort-oliveDeep">
            Celebrate Amidst Nature
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-gray-600">
            Over 25,000 square feet of manicured emerald green lawns framed by majestic palms and soft ambient lighting. The ultimate canvas for outdoor festivities.
          </p>
        </div>

        {/* Gallery & Facilities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          
          {/* Photos (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-luxury-lg border-4 border-white group">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                alt="Sadguru Lush Lawns Evening"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-resort-oliveDeep/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs uppercase tracking-widest text-resort-gold block">
                  25,000+ Sq. Ft. Emerald Lawn
                </span>
                <p className="font-display text-2xl font-bold">Nature's Own Grand Amphitheatre</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-36 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80"
                  alt="Outdoor Wedding Mandap"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-36 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80"
                  alt="Lawn Party Lighting"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Occasions List (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block mb-1">
                Outdoor Event Facilities
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-resort-oliveDeep">
                Versatile Open-Air Occasions
              </h3>
            </div>

            <div className="space-y-3">
              {lawnOccasions.map((occ, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-resort-beigeDark shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-resort-olive/10 text-resort-olive flex-shrink-0 mt-0.5">
                    <Trees className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-resort-oliveDeep">
                      {occ.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {occ.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Dedicated Lawn Event Booking & Enquiry Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-luxury border border-resort-beigeDark/80 max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block">
              Outdoor Event Reservations
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-resort-oliveDeep mt-1">
              Book the Lush Green Lawn
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Ensure your date is locked with our real-time database reservation system.
            </p>
          </div>

          {statusMessage && (
            <div className={`p-4 rounded-xl text-xs font-semibold mb-6 flex items-center justify-between ${
              statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <span>{statusMessage.text}</span>
              {confirmedBooking && (
                <span className="font-mono text-resort-oliveDeep bg-white px-2.5 py-1 rounded-md border">
                  Reference: {confirmedBooking.id}
                </span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Organizer / Host Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Deshmukh"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Mobile Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94220 55667"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="anand@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Desired Event Date *
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
                  Occasion Type *
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                >
                  <option value="Grand Wedding Reception">Grand Wedding Reception</option>
                  <option value="Sangeet & Cocktail Night">Sangeet & Cocktail Night</option>
                  <option value="Birthday Celebrations">Birthday Celebrations</option>
                  <option value="Corporate Gatherings">Corporate Gathering</option>
                  <option value="Photography Events">Pre-Wedding / Photography Event</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                  Estimated Gathering Size *
                </label>
                <select
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                  className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-resort-gold"
                >
                  <option value="150">Up to 150 Guests</option>
                  <option value="300">150 - 300 Guests</option>
                  <option value="500">300 - 500 Guests</option>
                  <option value="800">500+ Guests</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                Lawn Decor, Illumination & Buffet Requirements
              </label>
              <textarea
                rows="2"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Mention stage style, lighting preferences, catering counters..."
                className="w-full text-xs font-medium bg-resort-cream border border-resort-beigeDark rounded-xl p-3 focus:outline-none focus:border-resort-gold"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 italic">
                * Real-time conflict protection guarantees no double bookings for your chosen date.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-xl hover:shadow-gold-glow hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                {loading ? <span>Checking Availability...</span> : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Book Lawn</span>
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
