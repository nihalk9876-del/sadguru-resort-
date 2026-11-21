import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import AccommodationSection from '../components/AccommodationSection';
import SwimmingPoolSection from '../components/SwimmingPoolSection';
import BanquetHallSection from '../components/BanquetHallSection';
import LawnSection from '../components/LawnSection';
import PackagesSection from '../components/PackagesSection';
import FacilitiesSection from '../components/FacilitiesSection';
import PhotoGallerySection from '../components/PhotoGallerySection';
import TestimonialsSection from '../components/TestimonialsSection';
import LocationSection from '../components/LocationSection';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import TrackBookingModal from '../components/TrackBookingModal';
import PoolBookingModal from '../components/PoolBookingModal';
import PackageBookingModal from '../components/PackageBookingModal';
import SocialSidebar from '../components/SocialSidebar';
import { api } from '../services/api';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [packages, setPackages] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [searchDates, setSearchDates] = useState(null);

  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [poolModalOpen, setPoolModalOpen] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, pkgsRes, revsRes] = await Promise.all([
          api.getRooms(),
          api.getPackages(),
          api.getReviews()
        ]);
        if (roomsRes.rooms) setRooms(roomsRes.rooms);
        if (pkgsRes.packages) setPackages(pkgsRes.packages);
        if (revsRes.reviews) setReviews(revsRes.reviews);
      } catch (err) {
        console.error('Failed to load initial resort data:', err);
      }
    };

    fetchData();
  }, []);

  const handleOpenBooking = (room = null, dates = null) => {
    setSelectedRoomForBooking(room);
    if (dates) setSearchDates(dates);
    setBookingModalOpen(true);
  };

  const handleQuickSearch = ({ checkIn, checkOut, guests, category }) => {
    setSearchDates({ checkIn, checkOut, guests, category });
    setBookingModalOpen(true);
  };

  const handleOpenPackageBooking = (pkg) => {
    setSelectedPackageForBooking(pkg);
    setPackageModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-resort-cream text-resort-charcoal relative">
      {/* 2. Loading Screen */}
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* Floating Luxury Social Sidebar (Instagram, Facebook, WhatsApp) */}
      <SocialSidebar />

      {/* Main Website Content */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenTrack={() => setTrackModalOpen(true)}
      />

      <main>
        {/* 3. Hero Section */}
        <HeroSection
          onBookStay={() => handleOpenBooking()}
          onQuickSearch={handleQuickSearch}
        />

        {/* 12. About Section */}
        <AboutSection />

        {/* 4. Accommodation / Room Booking Section */}
        <AccommodationSection
          rooms={rooms}
          searchDates={searchDates}
          onBookRoom={(room) => handleOpenBooking(room)}
        />

        {/* 5. Luxurious Swimming Pool Section */}
        <SwimmingPoolSection
          onOpenPoolBooking={() => setPoolModalOpen(true)}
        />

        {/* 6. Luxurious Banquet Hall Section */}
        <BanquetHallSection />

        {/* 7. Green Lush Lawn Section */}
        <LawnSection />

        {/* 8. Resort Packages Section */}
        <PackagesSection
          packages={packages}
          onBookPackage={handleOpenPackageBooking}
        />

        {/* 12. Facilities & Amenities */}
        <FacilitiesSection />

        {/* 12. Photo Gallery */}
        <PhotoGallerySection />

        {/* 12. Guest Experiences & Testimonials */}
        <TestimonialsSection reviews={reviews} />

        {/* 12. Location & Maps */}
        <LocationSection />

        {/* 12. Frequently Asked Questions */}
        <FAQSection />

        {/* 12. Contact Us */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenTrack={() => setTrackModalOpen(true)}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Interactive Modals */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialRoom={selectedRoomForBooking}
        initialDates={searchDates}
      />

      <TrackBookingModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />

      <PoolBookingModal
        isOpen={poolModalOpen}
        onClose={() => setPoolModalOpen(false)}
      />

      <PackageBookingModal
        isOpen={packageModalOpen}
        onClose={() => setPackageModalOpen(false)}
        selectedPackage={selectedPackageForBooking}
      />
    </div>
  );
}
