import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';

export default function PhotoGallerySection() {
  const [filter, setFilter] = useState('All');
  const [lightboxImg, setLightboxImg] = useState(null);

  const categories = ['All', 'Rooms', 'Swimming Pool', 'Banquet Hall', 'Green Lawn', 'Dining'];

  const photos = [
    {
      category: 'Rooms',
      title: 'Deluxe AC Royal Suite',
      url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      span: 'col-span-1 md:col-span-2'
    },
    {
      category: 'Swimming Pool',
      title: 'Shree Sadguru Swimming Pool',
      url: '/sadguru-pool.jpg',
      span: 'col-span-1'
    },
    {
      category: 'Banquet Hall',
      title: 'Pillarless Grand Banquet Hall',
      url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      span: 'col-span-1'
    },
    {
      category: 'Green Lawn',
      title: '25,000 Sq. Ft. Emerald Lawn Reception',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      span: 'col-span-1 md:col-span-2'
    },
    {
      category: 'Rooms',
      title: 'Deluxe Family Suite Living Room',
      url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
      span: 'col-span-1'
    },
    {
      category: 'Swimming Pool',
      title: 'Poolside Deck & Sun Loungers',
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      span: 'col-span-1'
    },
    {
      category: 'Dining',
      title: 'Gourmet Outdoor Chef Service',
      url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      span: 'col-span-1'
    },
    {
      category: 'Green Lawn',
      title: 'Open-Air Wedding Mandap Setup',
      url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80',
      span: 'col-span-1'
    }
  ];

  const filteredPhotos = filter === 'All'
    ? photos
    : photos.filter(p => p.category.toLowerCase() === filter.toLowerCase());

  return (
    <section id="gallery" className="py-24 sm:py-32 relative overflow-hidden select-none text-white">
      {/* Background Image: Shree Sadguru Swimming Pool (Repeated, Little dark & atmospheric) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/sadguru-pool.jpg"
          alt="Sadguru Swimming Pool Atmosphere"
          className="w-full h-full object-cover object-center brightness-[0.78] contrast-[1.08]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Ambient Dark Overlay for flawless contrast and rich theme */}
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141d15]/85 via-black/25 to-[#141d15]/85 pointer-events-none" />
      </div>

      {/* Seamless Smooth Bleed at the Top (Upside) blending with Facilities section above */}
      <div className="absolute top-0 inset-x-0 h-44 sm:h-56 bg-gradient-to-b from-[#141d15] via-[#141d15]/60 to-transparent pointer-events-none z-10" />

      {/* Seamless Smooth Blend at the Bottom transitioning to Testimonials Section */}
      <div className="absolute bottom-0 inset-x-0 h-44 sm:h-56 bg-gradient-to-b from-transparent via-[#141d15]/60 to-[#141d15] pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-bold block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            ✦ Visual Splendour ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Sadguru Photo Gallery
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] font-light">
            A glimpse into the serene architecture, azure waters, manicured landscapes, and joyous celebrations at Sadguru Resort.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs uppercase tracking-wider font-semibold px-5 py-2.5 rounded-full transition-all ${filter === cat
                ? 'gold-gradient-bg text-resort-oliveDeep font-bold shadow-md'
                : 'bg-[#141d15]/80 backdrop-blur-md border border-resort-gold/30 text-white/90 hover:text-resort-gold hover:border-resort-gold'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, idx) => (
            <motion.div
              layout
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={() => setLightboxImg(photo)}
              className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border-2 border-resort-gold/40 hover:border-resort-gold transition-all"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] uppercase tracking-widest text-resort-gold font-bold">
                  {photo.category}
                </span>
                <p className="font-display text-lg font-bold">{photo.title}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-resort-gold">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Click to expand</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImg && (
          <div
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          >
            <div className="relative max-w-4xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={lightboxImg.url}
                alt={lightboxImg.title}
                className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border-2 border-white/20"
              />
              <div className="mt-3 flex items-center justify-between text-white px-2">
                <div>
                  <span className="text-xs uppercase tracking-widest text-resort-gold font-semibold block">
                    {lightboxImg.category}
                  </span>
                  <p className="font-display text-xl font-bold">{lightboxImg.title}</p>
                </div>
                <button
                  onClick={() => setLightboxImg(null)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
