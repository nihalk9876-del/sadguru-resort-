import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Waves, Clock, Users, ShieldCheck, Sparkles, Check, Droplets, Sun, Shirt } from 'lucide-react';

export default function SwimmingPoolSection({ onOpenPoolBooking }) {
  const poolImages = [
    {
      url: '/sadguru-pool.jpg',
      caption: 'Shree Sadguru Swimming Pool with Sunset Horizon'
    },
    {
      url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
      caption: 'Olympic-Styled Horizon Pool'
    },
    {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      caption: 'Poolside Sun Loungers & Umbrellas'
    },
    {
      url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
      caption: 'Crystal Clear Water with Natural Ozone Filtration'
    },
    {
      url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      caption: 'Evening Ambient Illumination'
    }
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const poolFeatures = [
    { icon: Droplets, title: 'Ozone Purified Water', desc: 'Skin-friendly, chlorine-optimized water maintained 3 times daily.' },
    { icon: Sun, title: 'Separate Kids Pool', desc: 'Shallow 1.5-foot depth splash pool with safety floaters for little ones.' },
    { icon: Shirt, title: 'Luxury Cabanas & Showers', desc: 'Air-conditioned changing suites, hot water showers, and clean lockers.' },
    { icon: Sparkles, title: 'Poolside Refreshments', desc: 'Mocktails, fresh coconut water, and artisanal snacks served at your deck.' },
  ];

  return (
    <section id="swimming-pool" className="relative py-24 sm:py-32 overflow-hidden text-white select-none">
      {/* Complete Section Background: Sadguru Walkway & Lantern Pathway (darker than original) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/sadguru-walkway.jpg"
          alt="Sadguru Resort Walkway Ambiance"
          className="w-full h-full object-cover object-center brightness-[0.78] contrast-[1.05]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Ambient Dark Overlay to make it deeper & darker than original */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141d15]/80 via-black/25 to-[#141d15]/80 pointer-events-none" />
      </div>

      {/* Seamless Smooth Blend at the Top merging with Accommodation Section above */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#141d15] via-[#141d15]/60 to-transparent pointer-events-none z-10" />

      {/* Seamless Smooth Blend at the Bottom transitioning to Banquet Section */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-b from-transparent via-[#FAF7F2]/60 to-[#FAF7F2] pointer-events-none z-10" />

      {/* Decorative water wave accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-bold block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            ✦ Aquatic Sanctuary ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Experience Our Luxurious Swimming Pool
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] font-light">
            Immerse yourself in crystal turquoise waters surrounded by tropical flora. An idyllic spot for sunbathing, swimming laps, or gentle evening relaxation.
          </p>
        </div>

        {/* Complimentary Room Guest Banner */}
        <div className="mb-12 p-4 rounded-2xl bg-gradient-to-r from-resort-oliveDeep/95 via-resort-olive/90 to-resort-oliveDeep/95 backdrop-blur-md text-resort-cream border border-resort-gold/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-resort-gold/20 text-resort-gold shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-resort-gold font-bold block">
                Resort Guest Policy
              </span>
              <p className="text-sm font-medium text-white/95">
                All in-house room guests receive <span className="text-resort-gold font-bold">100% Complimentary Swimming Pool Access</span> during their stay.
              </p>
            </div>
          </div>
          <span className="text-xs px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 uppercase tracking-wider font-semibold text-white backdrop-blur-sm">
            Daily Access Included
          </span>
        </div>

        {/* Gallery & Information Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Main Visual Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Big Active Image */}
            <div className="relative h-80 sm:h-[420px] rounded-2xl overflow-hidden shadow-2xl border-2 border-resort-gold/40 group">
              <img
                src={poolImages[activeImageIndex].url}
                alt={poolImages[activeImageIndex].caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs uppercase tracking-widest text-resort-gold block font-semibold drop-shadow">
                  Sadguru Poolside
                </span>
                <p className="font-serif italic text-lg text-white drop-shadow-md">{poolImages[activeImageIndex].caption}</p>
              </div>
            </div>

            {/* Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3">
              {poolImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-resort-gold scale-95 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Pricing, Timings & Separate Pool Booking Box (5 cols) */}
          <div className="lg:col-span-5 bg-[#141d15]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-resort-gold/40 space-y-6 text-white">
            <div className="border-b border-resort-gold/20 pb-4">
              <span className="text-[11px] uppercase tracking-widest text-resort-gold font-bold block mb-1">
                Day Visitors & Pool Passes
              </span>
              <h3 className="font-display text-2xl font-bold text-white drop-shadow-sm">
                Public Pool Slots & Timings
              </h3>
            </div>

            {/* Timings */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-black/40 border border-resort-gold/30 backdrop-blur-sm">
              <Clock className="w-5 h-5 text-resort-gold flex-shrink-0" />
              <div>
                <span className="text-[11px] text-resort-gold/80 uppercase tracking-wider block font-semibold">
                  Operating Timings
                </span>
                <span className="text-xs font-bold text-white tracking-wide">
                  06:00 AM – 09:00 PM (Everyday)
                </span>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-resort-gold/30 backdrop-blur-sm text-center hover:border-resort-gold/60 transition-colors">
                <span className="text-[10px] uppercase tracking-wider text-resort-gold/80 font-bold block">
                  Adult Pass
                </span>
                <span className="font-display font-bold text-2xl text-resort-gold block mt-0.5">
                  ₹350
                </span>
                <span className="text-[11px] text-gray-300 font-medium">Per Adult (Above 10 yrs)</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-resort-gold/30 backdrop-blur-sm text-center hover:border-resort-gold/60 transition-colors">
                <span className="text-[10px] uppercase tracking-wider text-resort-gold/80 font-bold block">
                  Child Pass
                </span>
                <span className="font-display font-bold text-2xl text-resort-gold block mt-0.5">
                  ₹200
                </span>
                <span className="text-[11px] text-gray-300 font-medium">Per Child (3 - 10 yrs)</span>
              </div>
            </div>

            {/* Facilities included */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-resort-gold font-bold block">
                Included with Pool Pass
              </span>
              <div className="grid grid-cols-1 gap-2 text-xs text-gray-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-resort-gold flex-shrink-0" />
                  <span>3-Hour allocated swimming slot</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-resort-gold flex-shrink-0" />
                  <span>Sanitized towel & locker access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-resort-gold flex-shrink-0" />
                  <span>Lifeguard supervision on duty</span>
                </div>
              </div>
            </div>

            {/* Dedicated Swimming Pool Booking Button */}
            <button
              onClick={onOpenPoolBooking}
              className="w-full py-3.5 rounded-xl gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Waves className="w-4 h-4" />
              <span>Book Swimming Pool Slot</span>
            </button>
            <p className="text-[11px] text-center text-gray-400 italic">
              * Swimwear mandatory. Advance online slot booking ensures guaranteed deck entry.
            </p>
          </div>

        </div>

        {/* Features Quad Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {poolFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bg-[#141d15]/85 backdrop-blur-md p-5 rounded-2xl border border-resort-gold/30 shadow-xl hover:shadow-2xl hover:border-resort-gold/70 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-resort-gold/15 border border-resort-gold/30 flex items-center justify-center text-resort-gold mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-resort-gold" />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-1 group-hover:text-resort-gold transition-colors">
                  {feat.title}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
