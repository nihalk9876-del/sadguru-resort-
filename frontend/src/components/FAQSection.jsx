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
    <section className="py-24 bg-resort-cream relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-semibold block">
            Got Questions?
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-resort-oliveDeep">
            Frequently Asked Questions
          </h2>
          <p className="font-serif italic text-base text-gray-600">
            Everything you need to know about reserving rooms, events, and day outing passes at Sadguru Resort.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-resort-beigeDark/80 shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-resort-cream/40 transition-colors"
              >
                <span className="font-display font-bold text-base text-resort-oliveDeep">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-resort-gold flex-shrink-0 transition-transform duration-300 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === idx && (
                <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-resort-beigeDark/40 pt-4 bg-resort-cream/20 animate-fadeIn">
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
