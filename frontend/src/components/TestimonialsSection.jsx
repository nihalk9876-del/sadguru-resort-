import React from 'react';
import { Star, Quote, Award } from 'lucide-react';

export default function TestimonialsSection({ reviews = [] }) {
  const displayReviews = reviews.length > 0 ? reviews : [
    {
      id: 'r1',
      name: 'Rohan & Neha Mehta',
      city: 'Pune',
      rating: 5,
      stayType: 'Couple Weekend Stay',
      comment: 'Sadguru Resort exceeded all our expectations! The lush green lawns, the serene sparkling pool, and the mouth-watering food made our wedding anniversary unforgettable. The staff was polite and attentive.',
      date: 'November 2026'
    },
    {
      id: 'r2',
      name: 'Dr. Rajesh Deshmukh',
      city: 'Nagpur',
      rating: 5,
      stayType: 'Family Vacation',
      comment: 'We stayed in the Deluxe Family Suite 201 with our parents and two children. The rooms were spotlessly clean, huge, and right next to the swimming pool. Highly recommended for family tranquility!',
      date: 'October 2026'
    },
    {
      id: 'r3',
      name: 'Snehal Wankhede',
      city: 'Akola',
      rating: 5,
      stayType: 'Engagement Ceremony',
      comment: 'We hosted our sister’s engagement in the AC Banquet Hall. The decor, sound system, and catering service were seamless. Guest feedback was 10/10.',
      date: 'October 2026'
    }
  ];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden select-none text-white">
      {/* Background Image: Sadguru Resort Main Entrance Arch & Grounds (Little dark & atmospheric) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/sadguru-main.jpg"
          alt="Sadguru Resort Entrance Atmosphere"
          className="w-full h-full object-cover object-[center_35%] brightness-[0.78] contrast-[1.08]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Ambient Dark Overlay to make it rich with perfect contrast */}
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141d15]/85 via-black/25 to-[#141d15]/85 pointer-events-none" />
      </div>

      {/* Seamless Smooth Bleed at the Top (Upside) blending with Photo Gallery section above */}
      <div className="absolute top-0 inset-x-0 h-44 sm:h-56 bg-gradient-to-b from-[#141d15] via-[#141d15]/60 to-transparent pointer-events-none z-10" />

      {/* Seamless Smooth Blend at the Bottom transitioning to Location Section */}
      <div className="absolute bottom-0 inset-x-0 h-44 sm:h-56 bg-gradient-to-b from-transparent via-[#141d15]/60 to-[#141d15] pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-bold block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            ✦ Guest Testimonials ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Words From Our Honoured Guests
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] font-light">
            Real stories of leisure, celebration, and cherished memories shared by guests who experienced Sadguru Resort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#141d15]/90 backdrop-blur-xl p-8 rounded-3xl border border-resort-gold/35 shadow-2xl hover:border-resort-gold hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group text-white"
            >
              <Quote className="w-10 h-10 text-resort-gold/20 absolute top-6 right-6" />
              
              <div className="space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-resort-gold text-resort-gold" />
                  ))}
                </div>

                <p className="font-serif italic text-sm text-gray-200 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-resort-gold/20 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-white">
                    {rev.name}
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    {rev.city} • {rev.stayType}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-resort-gold font-bold bg-resort-gold/15 border border-resort-gold/30 px-2.5 py-1 rounded-full">
                  Verified Stay
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
