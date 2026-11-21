import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, BedDouble, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection({ onBookStay, onQuickSearch }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState('2');
  const [category, setCategory] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onQuickSearch({ checkIn, checkOut, guests, category });
  };

  return (
    <section className="relative min-h-[95vh] lg:min-h-screen flex flex-col justify-between pt-32 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">

      {/* Real Sadguru Resort Photograph */}
      <div className="absolute inset-0 z-0">
        <img
          src="/sadguru-main.jpg"
          alt="Sadguru Resort Luxury Rooms"
          className="w-full h-full object-cover object-[center_35%]"
        />
        {/* Subtle, uniform dark overlay (around 35–45% opacity) + aesthetic depth for flawless text contrast */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-resort-oliveDeep/90 via-black/40 to-black/60 pointer-events-none" />
        {/* Seamless bottom blend into About section */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-b from-transparent via-[#141d15]/60 to-[#141d15] pointer-events-none" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto w-full text-center my-auto flex-1 flex flex-col justify-center items-center">

        {/* Refined Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <span className="font-serif italic text-xs sm:text-sm tracking-[0.28em] sm:tracking-[0.32em] uppercase text-resort-gold font-medium">
            ✦ A SANCTUARY OF TIMELESS HOSPITALITY ✦
          </span>
        </motion.div>

        {/* Center Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.16em] sm:tracking-[0.22em] text-white uppercase drop-shadow-2xl"
        >
          SADGURU RESORT
        </motion.h1>

        {/* Tightened 2-Line Subheadline for Elegance & Breathing Room */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-5 max-w-3xl mx-auto space-y-1.5 font-serif text-lg sm:text-xl md:text-2xl text-resort-cream font-light italic leading-relaxed"
        >
          <p className="text-white drop-shadow-sm font-normal">
            Where effortless elegance meets serene stillness.
          </p>
          <p className="text-resort-goldLight/95 font-light text-base sm:text-lg md:text-xl">
            Crafted for unhurried escapes, grand celebrations, and enduring memories in the embrace of nature.
          </p>
        </motion.div>

        {/* Elevated CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => onBookStay()}
            className="w-full sm:w-auto gold-gradient-bg text-resort-oliveDeep font-bold text-xs sm:text-sm uppercase tracking-[0.2em] px-9 py-4 rounded-full shadow-lg hover:shadow-gold-glow transform hover:-translate-y-0.5 transition-all"
          >
            RESERVE YOUR STAY
          </button>

          <a
            href="#facilities"
            className="w-full sm:w-auto border border-white/50 hover:border-resort-gold bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm uppercase tracking-[0.2em] font-medium px-9 py-4 rounded-full transition-all"
          >
            DISCOVER THE ESTATE
          </a>
        </motion.div>

      </div>

      {/* Floating Availability Search Card at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6 }}
        className="relative z-10 max-w-5xl mx-auto w-full mt-8"
      >
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-luxury-lg border border-resort-beigeDark/80 text-resort-charcoal">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-resort-beigeDark/60">
            <span className="font-display uppercase text-xs tracking-widest text-resort-brown font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-resort-gold" />
              Check Real-Time Room Availability
            </span>
            <span className="text-[11px] text-resort-olive/80 font-medium hidden sm:inline">
              Exclusive Luxury Accommodation • Guaranteed Best Rate
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            {/* Arrival */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block">
                Arrival Date
              </label>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                required
              />
            </div>

            {/* Departure */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block">
                Departure Date
              </label>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold"
                required
              />
            </div>

            {/* Guests */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block">
                Guests
              </label>
              <div className="relative">
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold appearance-none pr-6 cursor-pointer"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests (Family Suite)</option>
                  <option value="5">5 Guests (Family Suite)</option>
                  <option value="6">6 Guests (Family Suite)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Room Category */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block">
                Select Room Option
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-semibold bg-resort-cream border border-resort-beigeDark rounded-xl px-3 py-2.5 focus:outline-none focus:border-resort-gold appearance-none pr-6 cursor-pointer"
                >
                  <option value="">All 4 Room Options</option>
                  <option value="AC Deluxe Room">1) AC Deluxe Room (₹2,999)</option>
                  <option value="AC Deluxe Room with Swimming Pool">2) AC Deluxe Room with Pool (₹3,499)</option>
                  <option value="AC Double Deluxe Room (Family)">3) AC Double Deluxe (Family) (₹4,999)</option>
                  <option value="AC Double Deluxe Room with Swimming Pool">4) AC Double Deluxe with Pool (₹5,499)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Search Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest py-3 rounded-xl hover:shadow-gold-glow transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Check Availability</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>

    </section>
  );
}
