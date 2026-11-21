import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Calendar, Search, ShieldCheck } from 'lucide-react';

export default function Navbar({ onOpenBooking, onOpenTrack }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Suites', href: '#accommodation' },
    { label: 'Pool', href: '#swimming-pool' },
    { label: 'Banquet', href: '#banquet' },
    { label: 'Lawn', href: '#lawn' },
    { label: 'Packages', href: '#packages' },
    { label: 'Facilities', href: '#facilities' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
        {/* 100% Transparent Header - Full Width with Logo in Leftest Corner and Actions in Rightest Corner */}
        <header className="absolute top-0 left-0 right-0 z-40 bg-transparent py-6 text-white">
          <div className="w-full px-4 sm:px-8 lg:px-12">
            <div className="flex items-center justify-between w-full">

              {/* Logo in the Far Leftest Corner with Official Emblem */}
              <a href="#" className="flex items-center space-x-3 group flex-shrink-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-resort-gold/60 bg-white/10 p-0.5 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                  <img src="/logo.png" alt="Shri Sadguru Resort" className="w-full h-full object-contain rounded-full" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif tracking-[0.2em] font-bold text-base sm:text-lg uppercase text-white group-hover:text-resort-gold transition-colors drop-shadow-sm leading-tight">
                    SADGURU RESORT
                  </span>
                  <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-resort-gold font-medium">
                    RESORT & STAY
                  </span>
                </div>
              </a>

              {/* Navigation Links in Center */}
              <nav className="hidden lg:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-xs font-medium uppercase tracking-[0.18em] text-white/90 hover:text-resort-gold transition-colors drop-shadow-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* My Booking & Book Stay in the Far Rightest Corner */}
              <div className="hidden md:flex items-center space-x-3.5 flex-shrink-0">
                {/* My Booking: Outlined rounded-full pill with Search icon */}
                <button
                  onClick={onOpenTrack}
                  className="text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-full border border-white/40 hover:border-white text-white hover:bg-white/10 transition-all flex items-center gap-2 drop-shadow-sm"
                  title="Lookup and manage your reservation"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>MY BOOKING</span>
                </button>

                {/* Book Stay: Solid luxury gold pill with Calendar icon */}
                <button
                  onClick={() => onOpenBooking()}
                  className="gold-gradient-bg text-resort-oliveDeep font-semibold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full shadow-sm hover:shadow-gold-glow hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>BOOK STAY</span>
                </button>

                {/* Admin Portal Link */}
                <Link
                  to="/admin/login"
                  className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  title="Admin Management Portal"
                >
                  <ShieldCheck className="w-4 h-4" />
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden items-center space-x-2">
                <button
                  onClick={() => onOpenBooking()}
                  className="gold-gradient-bg text-resort-oliveDeep text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full"
                >
                  Book
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-white"
                  aria-label="Toggle Menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
              <div className="md:hidden bg-resort-oliveDeep border-b border-resort-gold/30 px-5 py-6 space-y-4 shadow-2xl animate-fadeIn">
                <div className="grid grid-cols-2 gap-2 text-center">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-3 rounded-xl bg-white/10 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/20"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                  <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenTrack();
                      }}
                      className="w-full py-2.5 px-4 rounded-full border border-white/40 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 bg-white/10"
                    >
                      <Search className="w-4 h-4" />
                      <span>MY BOOKING</span>
                    </button>

                    <Link
                      to="/admin/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2 px-4 rounded-full bg-resort-gold text-resort-oliveDeep text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 text-center"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin Login</span>
                    </Link>
                  </div>
                </div>
        )}
              </header>
            </>
          );
}
