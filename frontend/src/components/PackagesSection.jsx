import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Clock, Calendar, ArrowRight, Tag } from 'lucide-react';

export default function PackagesSection({ packages = [], onBookPackage }) {
  return (
    <section id="packages" className="py-24 bg-resort-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-semibold block">
            Curated Experiences
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-resort-oliveDeep">
            Exclusive Resort Packages
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-gray-600">
            Handpicked stay, celebration, and recreation packages designed to provide unparalleled luxury and value.
          </p>
        </div>

        {/* 8 Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl overflow-hidden shadow-luxury border border-resort-beigeDark/80 hover:shadow-luxury-lg hover:border-resort-gold/50 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo container */}
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  
                  {/* Validity tag */}
                  <div className="absolute top-3 left-3 bg-resort-oliveDeep/90 backdrop-blur-md text-resort-gold text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-resort-gold/30">
                    {pkg.duration}
                  </div>

                  {pkg.originalPrice && (
                    <div className="absolute top-3 right-3 bg-red-800/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Special Offer
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] uppercase tracking-widest text-resort-gold block">
                      {pkg.idealFor}
                    </span>
                    <h3 className="font-display font-bold text-lg leading-tight">
                      {pkg.name}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                      Package Inclusions
                    </span>
                    <ul className="space-y-1.5">
                      {pkg.inclusions.slice(0, 4).map((inc, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-gray-700">
                          <Check className="w-3.5 h-3.5 text-resort-gold flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[11px] text-gray-500 pt-2 border-t border-resort-beigeDark/50 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-resort-gold" />
                    <span>{pkg.validity}</span>
                  </div>
                </div>
              </div>

              {/* Pricing & CTA Footer */}
              <div className="p-5 pt-0 mt-3 border-t border-resort-beigeDark/50">
                <div className="flex items-baseline justify-between mb-3 pt-3">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-semibold block">All-Inclusive</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display font-bold text-2xl text-resort-oliveDeep">
                        ₹{pkg.price.toLocaleString('en-IN')}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{pkg.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onBookPackage(pkg)}
                  className="w-full py-2.5 rounded-xl gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest hover:shadow-gold-glow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <span>Book Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
