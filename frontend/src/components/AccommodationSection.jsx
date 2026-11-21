import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Wind, Waves, Check, Calendar, Eye, 
  Sparkles, X, CheckCircle2 
} from 'lucide-react';

export default function AccommodationSection({ 
  rooms = [], 
  onBookRoom 
}) {
  const [activeModalOption, setActiveModalOption] = useState(null);

  // The 4 Distinct Room Options (Configured with requested image filenames)
  const accommodationOptions = [
    {
      id: 'opt-ac-deluxe',
      optionNumber: 1,
      name: 'AC Deluxe Room',
      category: 'Deluxe AC',
      poolIncluded: false,
      tag: 'Classic Luxury',
      price: 2999,
      capacity: 'Up to 3 Guests',
      capacityNum: 3,
      bedType: '1 King Bed',
      sizeSqFt: 380,
      images: [
        '/ac_1d.jpg',
        '/sadguru-main.jpg'
      ],
      fallbackImage: '/sadguru-main.jpg',
      description: 'An elegantly appointed air-conditioned room with fine wooden craftsmanship, king-size comfort bedding, private balcony, and peaceful views.',
      poolBadge: 'Standard Pool Access',
      poolHighlighted: false,
      highlights: [
        'Climate-Controlled AC',
        '1 King Size Comfort Bed',
        'Private Balcony & Wi-Fi'
      ],
      amenities: [
        'Air Conditioning',
        '1 King Size Comfort Bed',
        'Private Balcony',
        'High-Speed Wi-Fi',
        '43-inch 4K Smart TV',
        'Electric Kettle & Tea Kit',
        '24/7 Room Service',
        'Daily Housekeeping'
      ]
    },
    {
      id: 'opt-ac-deluxe-pool',
      optionNumber: 2,
      name: 'AC Deluxe with Swimming Pool',
      category: 'Deluxe AC',
      poolIncluded: true,
      tag: 'Best Seller',
      price: 3499,
      capacity: 'Up to 3 Guests',
      capacityNum: 3,
      bedType: '1 King Bed',
      sizeSqFt: 380,
      images: [
        '/ac_2s.jpg',
        '/sadguru-pool.jpg'
      ],
      fallbackImage: '/sadguru-pool.jpg',
      description: 'Luxury air-conditioned deluxe room combined with complimentary unlimited swimming pool access at Shree Sadguru Swimming throughout your stay.',
      poolBadge: '✦ Unlimited Pool Access',
      poolHighlighted: true,
      highlights: [
        'Unlimited Swimming Pool Access',
        'Air Conditioning & King Bed',
        'Poolside Towels & Wi-Fi'
      ],
      amenities: [
        'Unlimited Swimming Pool Access Included',
        'Air Conditioning',
        '1 King Size Bed',
        'Pool Towels & Shower Facilities',
        'Private Balcony with Scenic View',
        'High-Speed Wi-Fi',
        '43-inch 4K Smart TV',
        '24/7 Concierge Support'
      ]
    },
    {
      id: 'opt-ac-double-deluxe-family',
      optionNumber: 3,
      name: 'AC Double Deluxe (Family)',
      category: 'Deluxe Family',
      poolIncluded: false,
      tag: 'Family Suite',
      price: 4999,
      capacity: 'Up to 6 Guests',
      capacityNum: 6,
      bedType: '2 King Beds',
      sizeSqFt: 620,
      images: [
        '/ac_dd1.jpg',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
      ],
      fallbackImage: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      description: 'Generously proportioned family sanctuary with double-room layout, two plush king-size beds, spacious living lounge, and private balcony.',
      poolBadge: 'Standard Pool Access',
      poolHighlighted: false,
      highlights: [
        'Spacious Family Suite (6 Guests)',
        '2 King Beds & Living Lounge',
        'Balcony overlooking Lawns'
      ],
      amenities: [
        'Spacious Family Suite (Up to 6 Guests)',
        '2 King Size Beds & Living Lounge',
        'Full Climate-Controlled AC',
        'Private Balcony with Lawn Views',
        'Mini Refrigerator & Kettle',
        'High-Speed Wi-Fi',
        '43-inch 4K Smart TV',
        '24/7 Dedicated Room Service'
      ]
    },
    {
      id: 'opt-ac-double-deluxe-family-pool',
      optionNumber: 4,
      name: 'AC Double Deluxe with Pool',
      category: 'Deluxe Family',
      poolIncluded: true,
      tag: 'Ultimate Family Package',
      price: 5499,
      capacity: 'Up to 6 Guests',
      capacityNum: 6,
      bedType: '2 King Beds',
      sizeSqFt: 620,
      images: [
        '/ac_dds2.jpg',
        '/sadguru-pool.jpg'
      ],
      fallbackImage: '/sadguru-pool.jpg',
      description: 'The ultimate vacation choice for families: spacious double deluxe suite accommodation paired with unlimited swimming pool access for the whole family.',
      poolBadge: '✦ Full Family Pool Access',
      poolHighlighted: true,
      highlights: [
        'Full Family Pool Passes Included',
        '2 King Beds & Family Lounge',
        'Kids & Adults Pool Access'
      ],
      amenities: [
        'Full Family Swimming Pool Passes Included',
        'Spacious Double Suite (Up to 6 Guests)',
        '2 King Beds & Family Seating Area',
        'Kids & Adults Pool Access with Float Support',
        'Full Climate-Controlled AC',
        'Private Balcony overlooking Pool & Lawns',
        'Mini Fridge, Wi-Fi & 4K Smart TV',
        '24/7 Dedicated Concierge & Room Service'
      ]
    }
  ];

  return (
    <section id="accommodation" className="py-24 sm:py-32 relative overflow-hidden select-none text-white">
      
      {/* Background Image: real3bg.jpg (No whitish wash - natural, clear & vibrant) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/real3bg.jpg"
          alt="Sadguru Resort Grounds & Accommodation"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Natural, clear ambient dark overlay without any whitish effect */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Seamless Smooth Blend at the Top merging with About Section above */}
      <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#141d15] via-[#141d15]/60 to-transparent pointer-events-none z-10" />

      {/* Seamless Smooth Blend at the Bottom transitioning to Swimming Pool section */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent via-[#141d15]/50 to-[#141d15] pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-bold block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            ✦ Suites & Residences ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Luxury Accommodation
          </h2>
          <p className="font-serif italic text-sm sm:text-base text-resort-cream drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] font-light">
            Select from our 4 tailored accommodation packages for your ideal stay at Sadguru Resort.
          </p>
        </div>

        {/* ALL 4 ROOMS IN A STRAIGHT SINGLE LINE (Decreased Height & Compact) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {accommodationOptions.map((opt) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-resort-beigeDark/80 hover:shadow-2xl hover:border-resort-gold/70 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Compact Photo Banner (Decreased Height: h-36 sm:h-40) */}
                <div className="relative h-36 sm:h-40 overflow-hidden bg-gray-100">
                  <img
                    src={opt.images[0]}
                    alt={opt.name}
                    onError={(e) => {
                      if (e.currentTarget.src !== opt.fallbackImage) {
                        e.currentTarget.src = opt.fallbackImage;
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Option Tag */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-resort-oliveDeep text-resort-gold border border-resort-gold/50 flex items-center justify-center font-bold text-[10px] shadow-sm">
                      {opt.optionNumber}
                    </span>
                    <span className="bg-resort-oliveDeep/90 backdrop-blur-md text-resort-gold text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-resort-gold/30">
                      {opt.tag}
                    </span>
                  </div>

                  {/* Pool Status Ribbon */}
                  <div className={`absolute bottom-2 inset-x-2 text-[10px] px-2.5 py-1 rounded-lg flex items-center justify-between shadow-sm ${
                    opt.poolHighlighted
                      ? 'bg-emerald-950/90 text-emerald-300 font-semibold border border-emerald-400/40'
                      : 'bg-black/65 backdrop-blur-md text-white/90 border border-white/10'
                  }`}>
                    <span className="flex items-center gap-1 truncate">
                      <Waves className={`w-3.5 h-3.5 flex-shrink-0 ${opt.poolHighlighted ? 'text-emerald-400' : 'text-resort-gold'}`} />
                      <span className="truncate">{opt.poolBadge}</span>
                    </span>
                  </div>
                </div>

                {/* Compact Card Body */}
                <div className="p-4 space-y-2.5">
                  {/* Title & Bed Specs */}
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-resort-oliveDeep group-hover:text-resort-goldDark transition-colors leading-snug line-clamp-1">
                      {opt.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-resort-gold" />
                        {opt.capacity}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Wind className="w-3 h-3 text-resort-gold" />
                        {opt.bedType}
                      </span>
                    </div>
                  </div>

                  {/* 3 Compact Bullet Highlights */}
                  <div className="space-y-1 pt-1.5 border-t border-resort-beigeDark/50 text-[11px] text-gray-600">
                    {opt.highlights.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compact Price & Booking Action */}
              <div className="p-4 pt-0 border-t border-resort-beigeDark/50 mt-2">
                <div className="flex items-baseline justify-between pt-2.5 mb-2.5">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                      Starting Rate
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-bold text-xl text-resort-oliveDeep">
                        ₹{opt.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-500">/ night</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModalOption(opt)}
                    className="text-[11px] text-resort-gold hover:text-resort-goldDark font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Details</span>
                  </button>
                </div>

                {/* Book Button */}
                <button
                  onClick={() => onBookRoom({
                    id: opt.id,
                    name: opt.name,
                    category: opt.category,
                    price: opt.price,
                    capacity: opt.capacityNum,
                    poolIncluded: opt.poolIncluded,
                    images: opt.images,
                    description: opt.description,
                    amenities: opt.amenities
                  })}
                  className="w-full py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider gold-gradient-bg text-resort-oliveDeep hover:shadow-gold-glow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Now</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Option Details Modal */}
      <AnimatePresence>
        {activeModalOption && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-resort-beigeDark"
            >
              {/* Modal Images Carousel / Hero */}
              <div className="relative h-60 sm:h-72 bg-black">
                <img
                  src={activeModalOption.images[0]}
                  alt={activeModalOption.name}
                  onError={(e) => {
                    if (e.currentTarget.src !== activeModalOption.fallbackImage) {
                      e.currentTarget.src = activeModalOption.fallbackImage;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setActiveModalOption(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-resort-gold px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Option {activeModalOption.optionNumber}: {activeModalOption.name}
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-7 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-resort-beigeDark pb-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-resort-oliveDeep">
                      {activeModalOption.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activeModalOption.capacity} • {activeModalOption.bedType} • {activeModalOption.sizeSqFt} sq.ft
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-2xl font-bold text-resort-gold block">
                      ₹{activeModalOption.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400">per night + taxes</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-resort-gold">
                    Package Description
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {activeModalOption.description}
                  </p>
                </div>

                {/* Pool Policy Notice */}
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  activeModalOption.poolHighlighted
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-resort-cream border-resort-beigeDark text-gray-700'
                }`}>
                  <Waves className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider">
                      Swimming Pool Access Policy
                    </h5>
                    <p className="text-[11px] mt-0.5">
                      {activeModalOption.poolHighlighted
                        ? 'Unlimited access to Shree Sadguru Swimming Pool with complimentary pool passes included for every guest.'
                        : 'Standard resort access. Pool passes can also be booked on-site at the reception.'}
                    </p>
                  </div>
                </div>

                {/* Complete Amenities */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-resort-gold">
                    Included Amenities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                    {activeModalOption.amenities.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-resort-cream rounded-lg border border-resort-beigeDark/50">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const opt = activeModalOption;
                      setActiveModalOption(null);
                      onBookRoom({
                        id: opt.id,
                        name: opt.name,
                        category: opt.category,
                        price: opt.price,
                        capacity: opt.capacityNum,
                        poolIncluded: opt.poolIncluded,
                        images: opt.images,
                        description: opt.description,
                        amenities: opt.amenities
                      });
                    }}
                    className="w-full py-3.5 rounded-xl gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow transition-all"
                  >
                    Proceed to Reserve {activeModalOption.name}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
