import React from 'react';
import { MapPin, Navigation, Phone, Train, Compass } from 'lucide-react';

export default function LocationSection() {
  return (
    <section id="location" className="py-24 bg-resort-creamDark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-resort-gold uppercase tracking-[0.25em] text-xs font-semibold block">
            Directions & Proximity
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-resort-oliveDeep">
            Location & Getting Here
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-gray-600">
            Conveniently positioned on Jalamb Road in Shegaon, enjoying peaceful open countryside tranquility while remaining just minutes from the railway station and divine shrine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Key Distance Highlights (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-resort-beigeDark/80 shadow-luxury space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-resort-gold/15 text-resort-gold">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Resort Sanctuary Address
                  </span>
                  <p className="text-sm font-bold text-resort-oliveDeep leading-relaxed mt-0.5">
                    Near Dnyaneshwar Mandir, Jalamb Road, Shegaon - 444203, Maharashtra, India
                  </p>
                </div>
              </div>

              {/* Transit Distances */}
              <div className="pt-4 border-t border-resort-beigeDark/60 space-y-3">
                <span className="text-xs uppercase tracking-wider text-resort-gold font-bold block">
                  Transit Distances
                </span>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-resort-cream border border-resort-beigeDark/60 text-xs">
                  <span className="font-medium text-gray-700">Shri Gajanan Maharaj Mandir</span>
                  <span className="font-bold text-resort-oliveDeep">2.8 km (7 mins)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-resort-cream border border-resort-beigeDark/60 text-xs">
                  <span className="font-medium text-gray-700">Shegaon Railway Junction (SEG)</span>
                  <span className="font-bold text-resort-oliveDeep">3.2 km (8 mins)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-resort-cream border border-resort-beigeDark/60 text-xs">
                  <span className="font-medium text-gray-700">Anand Sagar Spiritual Park</span>
                  <span className="font-bold text-resort-oliveDeep">4.5 km (10 mins)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-resort-cream border border-resort-beigeDark/60 text-xs">
                  <span className="font-medium text-gray-700">Khamgaon City Center</span>
                  <span className="font-bold text-resort-oliveDeep">18 km (25 mins)</span>
                </div>
              </div>
            </div>

            {/* Direction CTA */}
            <div className="pt-4 border-t border-resort-beigeDark/60 flex flex-col sm:flex-row gap-3">
              <a
                href="https://maps.google.com/?q=Shegaon+Maharashtra"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-wider text-center hover:shadow-gold-glow flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Google Maps</span>
              </a>

              <a
                href="tel:+919822011223"
                className="py-3 px-4 rounded-xl border border-resort-beigeDark hover:border-resort-gold text-resort-charcoal font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-resort-gold" />
                <span>Concierge Desk</span>
              </a>
            </div>
          </div>

          {/* Interactive Google Map Frame (7 cols) */}
          <div className="lg:col-span-7 h-96 lg:h-auto min-h-[380px] rounded-3xl overflow-hidden shadow-luxury border-4 border-white relative">
            <iframe
              title="Sadguru Resort Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59648.775878415715!2d76.6575791783203!3d20.793751099999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd749a0d82d43fb%3A0xe4a9f9393e9ad549!2sShegaon%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full filter saturate-110"
            />
          </div>

        </div>

      </div>
    </section>
  );
}
