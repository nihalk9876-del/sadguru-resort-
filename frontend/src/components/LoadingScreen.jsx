import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 2;
      });
    }, 28);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-resort-oliveDeep text-resort-cream px-6 select-none"
    >
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-resort-olive/40 via-transparent to-transparent pointer-events-none" />

      {/* Emblem / Monogram */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative mb-8 text-center"
      >
        <div className="w-24 h-24 mx-auto mb-5 rounded-full flex items-center justify-center relative shadow-gold-glow p-1 bg-white/5 border border-resort-gold/40">
          <img
            src="/logo.png"
            alt="Shri Sadguru Resort"
            className="w-full h-full object-contain rounded-full"
          />
          {/* Subtle spinning accent ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-t-resort-gold border-r-transparent border-b-transparent border-l-transparent"
          />
        </div>

        <motion.h1
          initial={{ letterSpacing: '0.2em', opacity: 0 }}
          animate={{ letterSpacing: '0.35em', opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-2xl sm:text-3xl md:text-4xl text-resort-gold uppercase font-bold tracking-[0.35em]"
        >
          SADGURU RESORT
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-serif italic text-sm sm:text-base text-resort-cream/80 mt-2 tracking-wide"
        >
          Where Luxury Meets Tranquillity
        </motion.p>
      </motion.div>

      {/* Subtle Progress Bar */}
      <div className="w-64 max-w-xs h-[2px] bg-white/10 rounded-full overflow-hidden relative mt-4">
        <motion.div
          className="h-full gold-gradient-bg"
          style={{ width: `${progress}%` }}
          transition={{ ease: 'linear' }}
        />
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        className="text-[11px] font-sans tracking-widest uppercase text-resort-gold/80 mt-3"
      >
        {progress < 100 ? `Crafting Your Sanctuary • ${progress}%` : 'Welcome'}
      </motion.span>
    </motion.div>
  );
}
