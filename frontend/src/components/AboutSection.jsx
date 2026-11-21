import React from 'react';
import { Award, Trees } from 'lucide-react';

export default function AboutSection() {
  const stats = [
    { value: '9', label: 'Bespoke Luxury Rooms', sub: '7 Deluxe AC & 2 Family Suites' },
    { value: '25,000+', label: 'Sq. Ft. Lush Lawns', sub: 'Scenic Outdoor Celebrations' },
    { value: '500+', label: 'Banquet Hall Capacity', sub: 'Pillarless Air-Conditioned Hall' },
    { value: '100%', label: 'Tranquil Serenity', sub: 'Surrounded by Pristine Nature' },
  ];

  return (
    <section id="about" className="relative py-24 sm:py-32 overflow-hidden text-white select-none">

      {/* Complete Section Background: Real Sadguru Swimming Pool */}
      <div className="absolute inset-0 z-0">
        <img
          src="/sadguru-pool.jpg"
          alt="Shree Sadguru Swimming Pool"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft, natural ambient tint */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/35 pointer-events-none" />
      </div>

      {/* Seamless Smooth Blending at the Junction with Hero Section */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#141d15] via-[#141d15]/60 to-transparent pointer-events-none z-10" />

      {/* Seamless Smooth Blending at the Bottom into Accommodation Section */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-b from-transparent via-[#141d15]/60 to-[#141d15] pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Visual: Official Logo Emblem (Larger & Prominent) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative group">
              {/* Warm gold ambient glow */}
              <div className="absolute -inset-2.5 rounded-full bg-gradient-to-r from-resort-gold/50 via-yellow-400/30 to-resort-goldLight/40 blur-xl opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Logo Emblem Container - Increased Size */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-full p-2.5 border-[3px] border-resort-gold bg-[#121913]/80 backdrop-blur-md shadow-2xl flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Shri Sadguru Resort Emblem"
                  className="w-full h-full object-contain rounded-full drop-shadow-md"
                />
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <span className="font-display text-sm sm:text-base uppercase tracking-[0.3em] text-yellow-400 font-bold block drop-shadow-md">
                EST. SHEGAON
              </span>
              <span className="font-serif italic text-sm text-resort-cream/90 block drop-shadow-sm">
                Sanctuary of Hospitality
              </span>
            </div>
          </div>

          {/* Right Text Content: Short, High-Standard, Important Only */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1.5">
              <span className="text-yellow-400 uppercase tracking-[0.25em] text-xs font-semibold block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                ✦ The Heritage of Hospitality ✦
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                A Peaceful Oasis Crafted for Memories
              </h2>
            </div>

            {/* Tightened High-Standard 2-Line Description (Concise & Impactful) */}
            <p className="font-serif text-lg sm:text-xl text-resort-cream leading-relaxed italic drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-light max-w-2xl">
              A serene sanctuary where timeless luxury meets the quiet beauty of nature. Thoughtfully created near the sacred soil of Shegaon for unhurried retreats, joyous family gatherings, and unforgettable celebrations.
            </p>

            {/* Highlights: No Black Background & Yellow Typography */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 max-w-2xl">
              <div className="flex items-center gap-3.5 py-1 px-1 bg-transparent">
                <div className="p-2.5 rounded-full border border-yellow-400/60 bg-yellow-400/10 text-yellow-400 shrink-0">
                  <Trees className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    Nature & Greenery
                  </h4>
                  <p className="text-xs text-yellow-100/90 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    Landscaped botanical lawns & floral walkways
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 py-1 px-1 bg-transparent">
                <div className="p-2.5 rounded-full border border-yellow-400/60 bg-yellow-400/10 text-yellow-400 shrink-0">
                  <Award className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    Exemplary Service
                  </h4>
                  <p className="text-xs text-yellow-100/90 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    24/7 personalized concierge care
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Counter Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {stats.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-black/35 backdrop-blur-sm p-3 rounded-xl border border-resort-gold/40 text-center shadow-lg hover:border-resort-gold transition-colors"
                >
                  <span className="font-display text-2xl font-bold text-resort-gold block drop-shadow-sm">
                    {s.value}
                  </span>
                  <span className="font-semibold text-[11px] text-white uppercase tracking-wider block mt-0.5 drop-shadow-sm">
                    {s.label}
                  </span>
                  <span className="text-[10px] text-gray-300 block mt-0.5">
                    {s.sub}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
