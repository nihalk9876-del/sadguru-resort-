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
    <section className="py-24 bg-resort-creamDark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-semibold block">
            Guest Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-resort-oliveDeep">
            Words From Our Honoured Guests
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-gray-600">
            Real stories of leisure, celebration, and cherished memories shared by guests who experienced Sadguru Resort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-8 rounded-3xl border border-resort-beigeDark/80 shadow-luxury hover:shadow-luxury-lg transition-all flex flex-col justify-between relative group"
            >
              <Quote className="w-10 h-10 text-resort-gold/20 absolute top-6 right-6" />
              
              <div className="space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-resort-gold text-resort-gold" />
                  ))}
                </div>

                <p className="font-serif italic text-sm text-gray-700 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-resort-beigeDark/60 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-resort-oliveDeep">
                    {rev.name}
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    {rev.city} • {rev.stayType}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-resort-gold font-bold bg-resort-gold/10 px-2.5 py-1 rounded-full">
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
