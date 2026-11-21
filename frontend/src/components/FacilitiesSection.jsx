import React from 'react';
import { 
  BellRing, Car, Wifi, Zap, 
  Baby, MapPin, Sparkles, ShieldCheck 
} from 'lucide-react';

export default function FacilitiesSection() {
  const facilities = [
    {
      icon: BellRing,
      title: '24/7 Room Service',
      desc: 'Prompt in-room dining, fresh morning tea, and round-the-clock concierge attention for any guest request.'
    },
    {
      icon: Car,
      title: 'Valet & Secure Parking',
      desc: 'Spacious on-premises parking facility accommodating 100+ vehicles with CCTV security and valet attendants.'
    },
    {
      icon: Wifi,
      title: 'High-Speed Wi-Fi',
      desc: 'Seamless dual-band fiber optical internet across all 9 luxury suites, swimming pool deck, and banquet areas.'
    },
    {
      icon: Zap,
      title: '100% Power Backup',
      desc: 'Heavy-duty dual automatic diesel generator setups ensuring zero interruption for celebrations and AC comfort.'
    },
    {
      icon: Baby,
      title: 'Kids Play Zone',
      desc: 'Dedicated safe green outdoor play park with slides, swings, and soft lawn recreation equipment.'
    },
    {
      icon: MapPin,
      title: 'Pilgrimage Assistance',
      desc: 'Private transfers and guidance for Shri Sant Gajanan Maharaj Temple darshan in Shegaon.'
    }
  ];

  return (
    <section id="facilities" className="pt-24 sm:pt-32 pb-44 sm:pb-56 relative overflow-hidden select-none text-white">
      {/* Background Image: Sadguru Resort Heritage Cart & Warli Wall Ambiance (Little bit darker) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/sadguru-facilities-bg.jpg"
          alt="Sadguru Resort Heritage Ambiance"
          className="w-full h-full object-cover object-center brightness-[0.78] contrast-[1.08]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Ambient Dark Overlay to make it a little bit darker while keeping the cart, Warli art & sunset rich & visible */}
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141d15]/85 via-black/30 to-[#141d15]/85 pointer-events-none" />
      </div>

      {/* Seamless Smooth Bleed at the Top (Upside) blending with Lawn section above */}
      <div className="absolute top-0 inset-x-0 h-44 sm:h-56 bg-gradient-to-b from-[#141d15] via-[#141d15]/60 to-transparent pointer-events-none z-10" />

      {/* Seamless Smooth Blend at the Bottom transitioning to Photo Gallery Section */}
      <div className="absolute bottom-0 inset-x-0 h-44 sm:h-56 bg-gradient-to-b from-transparent via-[#141d15]/60 to-[#141d15] pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-bold block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            ✦ Comfort & Convenience ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            World-Class Facilities
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] font-light">
            Carefully curated amenities to ensure your stay, event, and holiday are effortless, delightful, and relaxing.
          </p>
        </div>

        {/* 6 Facilities in a Balanced 3-Column Luxury Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="bg-[#141d15]/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-resort-gold/35 shadow-xl hover:shadow-2xl hover:border-resort-gold hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-resort-gold/15 border border-resort-gold/30 group-hover:bg-resort-gold/25 flex items-center justify-center text-resort-gold transition-all mb-4 group-hover:scale-105">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-base text-white group-hover:text-resort-gold uppercase tracking-wider mb-2 transition-colors">
                  {fac.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {fac.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
