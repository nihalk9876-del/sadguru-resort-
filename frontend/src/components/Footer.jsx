import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUp, Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ onOpenTrack, onOpenBooking }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-resort-oliveDeep text-resort-cream pt-20 pb-10 border-t border-resort-gold/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          
          {/* Brand Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-resort-gold/50 bg-white/10 p-0.5 shadow-sm">
                <img src="/logo.png" alt="Shri Sadguru Resort" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-display tracking-[0.22em] font-bold text-xl uppercase text-white">
                  SADGURU RESORT
                </span>
                <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-resort-gold">
                  RESORT & STAY • SHEGAON
                </span>
              </div>
            </div>

            <p className="font-serif italic text-sm text-resort-cream/80 max-w-sm leading-relaxed">
              Where luxury meets tranquillity. Experience unforgettable moments surrounded by nature. Relax, celebrate and create beautiful memories.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onOpenBooking}
                className="gold-gradient-bg text-resort-oliveDeep text-xs uppercase tracking-wider font-bold px-4 py-2 rounded-full hover:shadow-gold-glow"
              >
                Book Your Stay
              </button>
              <button
                onClick={onOpenTrack}
                className="border border-white/20 hover:border-resort-gold text-white text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-full transition-colors"
              >
                Track Booking
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-resort-gold">
              Sanctuary
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><a href="#about" className="hover:text-resort-gold transition-colors">About Sadguru</a></li>
              <li><a href="#accommodation" className="hover:text-resort-gold transition-colors">Deluxe AC Rooms (7)</a></li>
              <li><a href="#accommodation" className="hover:text-resort-gold transition-colors">Deluxe Family Suites (2)</a></li>
              <li><a href="#swimming-pool" className="hover:text-resort-gold transition-colors">Luxurious Swimming Pool</a></li>
              <li><a href="#facilities" className="hover:text-resort-gold transition-colors">Resort Facilities</a></li>
              <li><a href="#gallery" className="hover:text-resort-gold transition-colors">Photo Gallery</a></li>
            </ul>
          </div>

          {/* Celebrations & Events */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-resort-gold">
              Celebrations
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><a href="#banquet" className="hover:text-resort-gold transition-colors">AC Banquet Hall (500 Pax)</a></li>
              <li><a href="#lawn" className="hover:text-resort-gold transition-colors">25,000 Sq.Ft Lush Lawn</a></li>
              <li><a href="#banquet" className="hover:text-resort-gold transition-colors">Wedding & Engagement</a></li>
              <li><a href="#lawn" className="hover:text-resort-gold transition-colors">Open-Air Receptions</a></li>
              <li><a href="#banquet" className="hover:text-resort-gold transition-colors">Corporate Retreats</a></li>
              <li><a href="#facilities" className="hover:text-resort-gold transition-colors">Catering & Amenities</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-resort-gold">
              Reservations
            </h4>
            <div className="space-y-2.5 text-xs text-gray-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-resort-gold flex-shrink-0 mt-0.5" />
                <span>Jalamb Road, Near Dnyaneshwar Mandir, Shegaon - 444203</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-resort-gold flex-shrink-0" />
                <a href="tel:+919822011223" className="hover:text-white">+91 98220 11223</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-resort-gold flex-shrink-0" />
                <a href="mailto:contact@sadgururesort.com" className="hover:text-white">contact@sadgururesort.com</a>
              </p>

              <div className="pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 text-[11px] text-resort-gold/80 hover:text-resort-gold font-semibold uppercase tracking-wider py-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Management Portal</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Sadguru Resort. All rights reserved. A Premium Hospitality Experience.</p>
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-resort-gold hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
}
