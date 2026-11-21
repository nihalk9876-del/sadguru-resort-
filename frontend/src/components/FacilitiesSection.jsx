import React from 'react';
import { 
  Utensils, BellRing, Car, Wifi, Zap, 
  Baby, MapPin, Sparkles, ShieldCheck, Shirt 
} from 'lucide-react';

export default function FacilitiesSection() {
  const facilities = [
    {
      icon: Utensils,
      title: 'Multi-Cuisine Dining',
      desc: 'Freshly prepared pure vegetarian delicacies, Maharashtrian specialties, and North Indian feasts crafted by experienced chefs.'
    },
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
    },
    {
      icon: Shirt,
      title: 'Laundry & Housekeeping',
      desc: 'Same-day laundry services and meticulous twice-daily sanitization and towel replenishment.'
    }
  ];

  return (
    <section id="facilities" className="py-24 bg-resort-creamDark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-semibold block">
            Comfort & Convenience
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-resort-oliveDeep">
            World-Class Facilities
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-gray-600">
            Carefully curated amenities to ensure your stay, event, and holiday are effortless, delightful, and relaxing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-resort-beigeDark/80 shadow-luxury hover:shadow-luxury-lg hover:border-resort-gold/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-resort-olive/10 group-hover:bg-resort-gold/20 flex items-center justify-center text-resort-olive group-hover:text-resort-brown transition-colors mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-base text-resort-oliveDeep uppercase tracking-wider mb-2">
                  {fac.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
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
