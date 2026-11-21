import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'What are the check-in and check-out timings at Sadguru Resort?',
      a: 'Standard check-in time is 01:00 PM and check-out time is 11:00 AM. Early check-in or late check-out can be requested subject to availability and room turnover schedules.'
    },
    {
      q: 'Is swimming pool access complimentary for room guests?',
      a: 'Yes, 100%! All resident room guests enjoy complimentary swimming pool access during daily operating hours (06:00 AM to 09:00 PM). Proper swimwear is required for hygiene.'
    },
    {
      q: 'What is the total room inventory and categories available?',
      a: 'Sadguru Resort features an exclusive inventory of 9 luxury air-conditioned accommodations: 7 Deluxe AC Suites (capacity up to 3 guests) and 2 Deluxe Family Grand Suites (capacity up to 6 guests).'
    },
    {
      q: 'Can non-resident visitors book swimming pool slots?',
      a: 'Yes. Non-resident visitors can book separate public pool slots via our website. Adult passes are priced at ₹350 and child passes (ages 3–10) are ₹200 per 3-hour session.'
    },
    {
      q: 'How does the banquet hall and lawn date reservation work?',
      a: 'Our online reservation system enforces real-time conflict prevention. When your event date and slot are submitted and confirmed, the system immediately locks the calendar to prevent duplicate reservations.'
    },
    {
      q: 'What is the cancellation and refund policy?',
      a: 'Cancellations made 48 hours or more before the check-in date are fully refundable. When a reservation is cancelled, the room or event slot is instantly returned to the public pool of available dates.'
    }
  ];

  return (
    <section id="faq" className="py-24 sm:py-32 relative overflow-hidden select-none text-white">
      {/* Background Image: Sadguru Banquet Hall Night Illumination (Hall Photo, Little dark) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/sadguru-banquet-night.jpg"
          alt="Sadguru Banquet Hall Atmosphere"
          className="w-full h-full object-cover object-center brightness-[0.78] contrast-[1.08]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Ambient Dark Overlay to make it rich with perfect contrast */}
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141d15]/85 via-black/25 to-[#141d15]/85 pointer-events-none" />
      </div>

      {/* Seamless Smooth Bleed at the Top (Upside) blending with Location section above */}
      <div className="absolute top-0 inset-x-0 h-44 sm:h-56 bg-gradient-to-b from-[#141d15] via-[#141d15]/60 to-transparent pointer-events-none z-10" />

      {/* Seamless Smooth Blend at the Bottom transitioning to Contact Section */}
      <div className="absolute bottom-0 inset-x-0 h-44 sm:h-56 bg-gradient-to-b from-transparent via-[#FAF7F2]/70 to-[#FAF7F2] pointer-events-none z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        <div className="text-center space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-bold block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            ✦ Got Questions? ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Frequently Asked Questions
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] font-light">
            Everything you need to know about reserving rooms, events, and day outing passes at Sadguru Resort.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#141d15]/90 backdrop-blur-xl rounded-2xl border border-resort-gold/35 shadow-xl overflow-hidden transition-all text-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
              >
                <span className="font-display font-bold text-base text-white">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-resort-gold flex-shrink-0 transition-transform duration-300 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === idx && (
                <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-gray-200 leading-relaxed border-t border-resort-gold/20 pt-4 bg-black/40 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
