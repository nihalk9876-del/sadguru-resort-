const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { DB_FILE } = require('../config/constants');

const seedData = async () => {
  const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

  const rooms = [
    {
      id: 'room-101',
      roomNumber: 101,
      name: 'Deluxe AC Heritage Suite 101',
      category: 'Deluxe AC',
      price: 3499,
      capacity: 3,
      bedType: '1 King Size Bed',
      sizeSqFt: 380,
      view: 'Pool & Garden View',
      description: 'An elegantly appointed air-conditioned sanctuary with rich wooden accents, plush bedding, and private balcony overlooking the resort pool and manicured gardens.',
      amenities: [
        'Air Conditioning',
        'Complimentary Swimming Pool Access',
        'High-Speed Wi-Fi',
        '43-inch 4K Smart TV',
        'Mini Refrigerator',
        'Private Balcony',
        'Premium Herbal Toiletries',
        'Electric Kettle & Tea Kit',
        '24/7 Room Service',
        'Daily Housekeeping'
      ],
      images: [
        '/sadguru-main.jpg',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'Available',
      floor: '1st Floor'
    },
    {
      id: 'room-102',
      roomNumber: 102,
      name: 'Deluxe AC Garden Vista 102',
      category: 'Deluxe AC',
      price: 3499,
      capacity: 3,
      bedType: '1 King Size Bed',
      sizeSqFt: 380,
      view: 'Lush Lawn View',
      description: 'Wake up to the refreshing scent of dew on emerald lawns. Features calm earth-tone interiors, soundproof French windows, and soothing mood lighting.',
      amenities: [
        'Air Conditioning',
        'Complimentary Swimming Pool Access',
        'High-Speed Wi-Fi',
        '43-inch 4K Smart TV',
        'Mini Refrigerator',
        'Private Balcony',
        'Premium Herbal Toiletries',
        'Electric Kettle & Tea Kit',
        '24/7 Room Service'
      ],
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'Available',
      floor: '1st Floor'
    },
    {
      id: 'room-103',
      roomNumber: 103,
      name: 'Deluxe AC Royal Court 103',
      category: 'Deluxe AC',
      price: 3499,
      capacity: 3,
      bedType: '1 King Size Bed',
      sizeSqFt: 390,
      view: 'Courtyard & Fountain View',
      description: 'Sophisticated royal aesthetics with warm lighting, hand-carved headboards, and full climate control for supreme relaxation.',
      amenities: [
        'Air Conditioning',
        'Complimentary Swimming Pool Access',
        'High-Speed Wi-Fi',
        '43-inch 4K Smart TV',
        'Mini Refrigerator',
        'Private Balcony',
        'Premium Herbal Toiletries',
        'Electric Kettle & Tea Kit',
        '24/7 Room Service'
      ],
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'Available',
      floor: '1st Floor'
    },
    {
      id: 'room-104',
      roomNumber: 104,
      name: 'Deluxe AC Serenity Corner 104',
      category: 'Deluxe AC',
      price: 3499,
      capacity: 3,
      bedType: '1 King Size Bed',
      sizeSqFt: 385,
      view: 'Sunset & Garden View',
      description: 'Tucked at the tranquil corner of the east wing, offering undisturbed peace, expansive garden vistas, and soothing evening sunsets.',
      amenities: [
        'Air Conditioning',
        'Complimentary Swimming Pool Access',
        'High-Speed Wi-Fi',
        '43-inch 4K Smart TV',
        'Mini Refrigerator',
        'Private Balcony',
        'Premium Herbal Toiletries',
        'Electric Kettle & Tea Kit',
        '24/7 Room Service'
      ],
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'Available',
      floor: '1st Floor'
    },
    {
      id: 'room-105',
      roomNumber: 105,
      name: 'Deluxe AC Green Meadow 105',
      category: 'Deluxe AC',
      price: 3499,
      capacity: 3,
      bedType: '1 King Size Bed',
      sizeSqFt: 380,
      view: 'Lawn & Flora View',
      description: 'Earthy luxury seamlessly blended with contemporary technology. Includes ergonomic workspace, cozy armchair, and luxury cotton linens.',
      amenities: [
        'Air Conditioning',
        'Complimentary Swimming Pool Access',
        'High-Speed Wi-Fi',
        '43-inch 4K Smart TV',
        'Mini Refrigerator',
        'Private Balcony',
        'Premium Herbal Toiletries',
        'Electric Kettle & Tea Kit',
        '24/7 Room Service'
      ],
      images: [
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'Available',
      floor: '1st Floor'
    },
    {
      id: 'room-106',
      roomNumber: 106,
      name: 'Deluxe AC Palm Breeze 106',
      category: 'Deluxe AC',
      price: 3499,
      capacity: 3,
      bedType: '1 King Size Bed',
      sizeSqFt: 380,
      view: 'Poolside Palm Canopy',
      description: 'Overlooking gentle swaying palm trees and the glittering pool surface. Designed for couples and travelers seeking calm refreshment.',
      amenities: [
        'Air Conditioning',
        'Complimentary Swimming Pool Access',
        'High-Speed Wi-Fi',
        '43-inch 4K Smart TV',
        'Mini Refrigerator',
        'Private Balcony',
        'Premium Herbal Toiletries',
        'Electric Kettle & Tea Kit',
        '24/7 Room Service'
      ],
      images: [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'Available',
      floor: '1st Floor'
    },
    {
      id: 'room-107',
      roomNumber: 107,
      name: 'Deluxe AC Tranquil Haven 107',
      category: 'Deluxe AC',
      price: 3499,
      capacity: 3,
      bedType: '1 King Size Bed',
      sizeSqFt: 380,
      view: 'Garden & Lawn View',
      description: 'Spacious and silent, complete with artisan marble bathroom, walk-in rain shower, and serene outdoor sitting terrace.',
      amenities: [
        'Air Conditioning',
        'Complimentary Swimming Pool Access',
        'High-Speed Wi-Fi',
        '43-inch 4K Smart TV',
        'Mini Refrigerator',
        'Private Balcony',
        'Premium Herbal Toiletries',
        'Electric Kettle & Tea Kit',
        '24/7 Room Service'
      ],
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'Available',
      floor: '1st Floor'
    },
    {
      id: 'room-201',
      roomNumber: 201,
      name: 'Deluxe Family Grand Suite 201',
      category: 'Deluxe Family',
      price: 5999,
      capacity: 6,
      bedType: '2 King Size Beds + Lounge Sofa',
      sizeSqFt: 620,
      view: 'Panoramic Pool & Lawn View',
      description: 'Expansive family residence featuring 2 king bedrooms, attached living hall, custom dining nook, and wrap-around viewing terrace. Ideal for family holidays and wedding groups.',
      amenities: [
        'Dual Air Conditioning Units',
        'Complimentary Swimming Pool Access for All Guests',
        'High-Speed Wi-Fi',
        '55-inch 4K Smart TV',
        'Large Refrigerator & Bar Counter',
        'Spacious Living Room & Sofa Lounge',
        'Two Attached Luxury Bathrooms with Bathtub',
        'Large Private Wrap-Around Balcony',
        'Electric Kettle, Microwave & Tea/Coffee Station',
        '24/7 Room Service',
        'Intercom & Concierge Assistance'
      ],
      images: [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'Available',
      floor: '2nd Floor'
    },
    {
      id: 'room-202',
      roomNumber: 202,
      name: 'Deluxe Family Regal Villa 202',
      category: 'Deluxe Family',
      price: 5999,
      capacity: 6,
      bedType: '2 King Size Beds + 1 Daybed',
      sizeSqFt: 640,
      view: 'Poolside & Nature Vista',
      description: 'The epitome of family opulence at Sadguru Resort. Offers dual master chambers, bespoke ambient illumination, and private sit-out overlooking the pool reflections.',
      amenities: [
        'Dual Air Conditioning Units',
        'Complimentary Swimming Pool Access for All Guests',
        'High-Speed Wi-Fi',
        '55-inch 4K Smart TV',
        'Large Refrigerator & Bar Counter',
        'Spacious Living Room & Sofa Lounge',
        'Two Attached Luxury Bathrooms with Bathtub',
        'Large Private Wrap-Around Balcony',
        'Electric Kettle, Microwave & Tea/Coffee Station',
        '24/7 Room Service',
        'Intercom & Concierge Assistance'
      ],
      images: [
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'Available',
      floor: '2nd Floor'
    }
  ];

  const packages = [
    {
      id: 'pkg-couple-stay',
      name: 'Couple Stay Package',
      tagline: 'Romantic Escape Amidst Nature',
      price: 5999,
      originalPrice: 7999,
      validity: 'Valid all year round',
      duration: '1 Night / 2 Days',
      idealFor: 'Couples & Honeymooners',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      description: 'Escape to intimate luxury with your significant other. Includes decorated Deluxe AC suite, private poolside candlelight dinner, and rejuvenating morning dip.',
      inclusions: [
        '1 Night Stay in Deluxe AC Heritage Suite',
        'Romantic Floral Room Decoration on arrival',
        'Candlelight 4-course Dinner by the pool',
        'Complimentary Swimming Pool access',
        'Breakfast in bed with freshly brewed artisan coffee',
        'Late check-out privilege up to 2:00 PM'
      ]
    },
    {
      id: 'pkg-family-stay',
      name: 'Family Stay Package',
      tagline: 'Cherished Family Moments & Fun',
      price: 9999,
      originalPrice: 12999,
      validity: 'Weekdays & Weekends',
      duration: '1 Night / 2 Days',
      idealFor: 'Families of 4 to 6 Guests',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      description: 'Unwind together in our spacious Deluxe Family Grand Suite with multi-course meals, children swimming pool access, and engaging lawn games.',
      inclusions: [
        '1 Night Stay in Deluxe Family Grand Suite (up to 4-6 members)',
        'Full Swimming Pool access with pool floats & towels',
        'Chef special buffet breakfast & lavish evening dinner',
        'Evening lawn high tea with assorted hot savouries',
        'Badminton & lawn outdoor recreation kit access',
        'Complimentary accommodation for children below 6'
      ]
    },
    {
      id: 'pkg-day-outing',
      name: 'Day Outing Package',
      tagline: 'Recharge & Refresh for the Day',
      price: 1499,
      originalPrice: 1999,
      validity: 'Daily (9:00 AM - 6:00 PM)',
      duration: 'Full Day (9 AM to 6 PM)',
      idealFor: 'Friends, Colleagues & Family Groups',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      description: 'Spend an invigorating day away from city noise. Dive into the crystal swimming pool, savor sumptuous chef-curated buffet, and relax on open lawns.',
      inclusions: [
        'Traditional welcome drink & refreshment on arrival',
        'Unlimited Swimming Pool access (separate adult & baby pool)',
        'Lavish multi-cuisine buffet lunch with dessert spread',
        'Evening tea/coffee with hot pakodas and cookies',
        'Changing rooms & locker facility provided'
      ]
    },
    {
      id: 'pkg-pool-fun',
      name: 'Swimming Pool Package',
      tagline: 'Splash, Sun & Poolside Vibes',
      price: 799,
      originalPrice: 1099,
      validity: 'All days, slot-based',
      duration: '4-Hour Pool Session',
      idealFor: 'Swimmers & Leisure Seekers',
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
      description: 'Beat the heat in our pristine, temperature-regulated Olympic-styled swimming pool with sun loungers, towel service, and delicious mocktails.',
      inclusions: [
        '4 Hours dedicated pool slot access',
        'Complimentary chilled exotic mocktail on arrival',
        'Plush sun-bed and clean towel service',
        'Poolside finger-food snack platter',
        'Access to hygienic shower & changing cabanas'
      ]
    },
    {
      id: 'pkg-birthday-bash',
      name: 'Birthday Celebration Package',
      tagline: 'Make Birthdays Truly Extraordinary',
      price: 14999,
      originalPrice: 18999,
      validity: 'Prior booking required (3 days)',
      duration: '4 to 5 Hours Event',
      idealFor: 'Birthdays & Private Anniversaries (up to 20 guests)',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      description: 'Host a stylish, hassle-free birthday extravaganza on the green lawn or poolside cabana with bespoke balloon decorations, music, and finger-licking cuisine.',
      inclusions: [
        'Themed balloon arch & banner decoration setup',
        '1.5 kg premium celebration cake (choice of flavors)',
        'Party sound & Bluetooth music system setup',
        '3 veg starters, 1 welcome drink, and dinner buffet for 15 guests',
        'Dedicated event coordinator and service captain'
      ]
    },
    {
      id: 'pkg-corporate-event',
      name: 'Corporate Event Package',
      tagline: 'Productive Meets & Executive Retreats',
      price: 24999,
      originalPrice: 32000,
      validity: 'Monday to Friday',
      duration: 'Full Day (8 Hours)',
      idealFor: 'Corporate Teams, Offsites & Board Meets (up to 40 delegates)',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      description: 'Bring your team together in our state-of-the-art air-conditioned banquet hall with high-speed Wi-Fi, crystal audio-visuals, and gourmet executive catering.',
      inclusions: [
        'Fully air-conditioned Banquet Hall setup for 8 hours',
        'HD Projector, large presentation screen & cordless mics',
        'High-speed enterprise conference Wi-Fi',
        '2 times tea/coffee breaks with bakery cookies and savoury snacks',
        'Executive 3-course business lunch buffet'
      ]
    },
    {
      id: 'pkg-wedding-celebration',
      name: 'Wedding Celebration Package',
      tagline: 'The Royal Fairytale Wedding Destination',
      price: 95000,
      originalPrice: 125000,
      validity: 'Subject to date availability',
      duration: '24 Hours Venue Access',
      idealFor: 'Weddings, Engagements & Grand Sangeet',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      description: 'Your dream wedding brought to life across our 25,000 sq.ft emerald green lawns and majestic air-conditioned banquet hall with majestic stage backdrops.',
      inclusions: [
        'Full 24-hour exclusive access to Lush Green Lawn & Banquet Hall',
        'Majestic royal Mandap / Reception Stage structure setup',
        'Architectural fairy-light illumination across palms & lawns',
        '4 Deluxe AC Rooms included for bride/groom and family stay',
        'Full generator backup and valet parking attendants',
        'Green room and bridal preparation suites'
      ]
    },
    {
      id: 'pkg-weekend-getaway',
      name: 'Weekend Getaway Package',
      tagline: 'Pure Serenity, Zero Stress',
      price: 7999,
      originalPrice: 9999,
      validity: 'Friday to Sunday Stays',
      duration: '2 Nights / 3 Days',
      idealFor: 'Couples & Solo Travelers seeking peace',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      description: 'A 3-day slow holiday surrounded by birdsong, water reflections, and soothing greenery. Return back fully rejuvenated.',
      inclusions: [
        '2 Nights Stay in Deluxe AC Heritage Room',
        'Daily gourmet morning breakfast spread',
        'Unlimited swimming pool access throughout the stay',
        '20% exclusive discount on food & beverages',
        'Complimentary high-speed Wi-Fi and late checkout at 1:00 PM'
      ]
    }
  ];

  const now = new Date();
  const formatOffsetDate = (offsetDays) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const sampleBookings = [
    {
      id: 'SR-RM-2026-0101',
      type: 'room',
      roomId: 'room-101',
      roomNumber: 101,
      roomName: 'Deluxe AC Heritage Suite 101',
      category: 'Deluxe AC',
      customerName: 'Anand Kulkarni',
      phone: '+91 98223 45678',
      email: 'anand.kulkarni@example.com',
      checkIn: formatOffsetDate(0), // Today
      checkOut: formatOffsetDate(2),
      nights: 2,
      guests: 2,
      adults: 2,
      children: 0,
      nightlyRate: 3499,
      subtotal: 6998,
      taxAmount: 840,
      totalAmount: 7838,
      advancePaid: 7838,
      remainingBalance: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'UPI - Google Pay',
      status: 'Confirmed',
      specialRequests: 'Quiet room on upper floor preferred, extra pillows',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'SR-RM-2026-0102',
      type: 'room',
      roomId: 'room-201',
      roomNumber: 201,
      roomName: 'Deluxe Family Grand Suite 201',
      category: 'Deluxe Family',
      customerName: 'Sanjay Deshmukh',
      phone: '+91 94231 87654',
      email: 'sanjay.deshmukh@gmail.com',
      checkIn: formatOffsetDate(1), // Tomorrow
      checkOut: formatOffsetDate(3),
      nights: 2,
      guests: 5,
      adults: 4,
      children: 1,
      nightlyRate: 5999,
      subtotal: 11998,
      taxAmount: 1440,
      totalAmount: 13438,
      advancePaid: 5000,
      remainingBalance: 8438,
      paymentStatus: 'Partial Advance',
      paymentMethod: 'Net Banking',
      status: 'Confirmed',
      specialRequests: 'Family with elderly parents, ground level assistance',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'SR-RM-2026-0103',
      type: 'room',
      roomId: 'room-105',
      roomNumber: 105,
      roomName: 'Deluxe AC Green Meadow 105',
      category: 'Deluxe AC',
      customerName: 'Priya Sharma',
      phone: '+91 91234 56789',
      email: 'priya.sharma@yahoo.com',
      checkIn: formatOffsetDate(-3),
      checkOut: formatOffsetDate(-1),
      nights: 2,
      guests: 2,
      adults: 2,
      children: 0,
      nightlyRate: 3499,
      subtotal: 6998,
      taxAmount: 840,
      totalAmount: 7838,
      advancePaid: 7838,
      remainingBalance: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
      status: 'Completed',
      specialRequests: '',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
    }
  ];

  const poolBookings = [
    {
      id: 'SR-PL-2026-0101',
      type: 'swimming_pool',
      customerName: 'Amit Joshi',
      phone: '+91 98901 23456',
      email: 'amit.joshi@gmail.com',
      date: formatOffsetDate(0),
      timeSlot: '04:00 PM - 07:00 PM',
      adultCount: 3,
      childCount: 1,
      totalVisitors: 4,
      totalAmount: 1250,
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      status: 'Confirmed',
      notes: 'Group visit with kids',
      createdAt: new Date().toISOString()
    }
  ];

  const banquetBookings = [
    {
      id: 'SR-BQ-2026-0101',
      type: 'banquet',
      customerName: 'Vikas Patil',
      phone: '+91 98602 33445',
      email: 'vikas.patil@outlook.com',
      date: formatOffsetDate(5),
      timeSlot: 'Evening (05:00 PM - 11:00 PM)',
      eventType: 'Engagement Ceremony',
      guestCount: 220,
      requirements: 'Stage floral setup, sound system, vegetarian dinner spread',
      estimatedAmount: 55000,
      advancePaid: 20000,
      status: 'Confirmed',
      paymentStatus: 'Partial Advance',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ];

  const lawnBookings = [
    {
      id: 'SR-LW-2026-0101',
      type: 'lawn',
      customerName: 'Sunil Mahajan',
      phone: '+91 94220 88990',
      email: 'sunil.mahajan@gmail.com',
      date: formatOffsetDate(10),
      eventType: 'Grand Wedding Reception',
      guestCount: 450,
      requirements: 'Full lawn fairytale fairy lights, mandap setup, valet parking',
      estimatedAmount: 85000,
      advancePaid: 35000,
      status: 'Confirmed',
      paymentStatus: 'Partial Advance',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ];

  const reviews = [
    {
      id: 'rev-1',
      name: 'Rohan & Neha Mehta',
      city: 'Pune',
      rating: 5,
      stayType: 'Couple Weekend Stay',
      comment: 'Sadguru Resort exceeded all our expectations! The lush green lawns, the serene sparkling pool, and the mouth-watering food made our wedding anniversary unforgettable. The staff was polite and attentive.',
      date: 'November 2026'
    },
    {
      id: 'rev-2',
      name: 'Dr. Rajesh Deshmukh',
      city: 'Nagpur',
      rating: 5,
      stayType: 'Family Vacation',
      comment: 'We stayed in the Deluxe Family Suite 201 with our parents and two children. The rooms were spotlessly clean, huge, and right next to the swimming pool. Highly recommended for family tranquility!',
      date: 'October 2026'
    },
    {
      id: 'rev-3',
      name: 'Snehal Wankhede',
      city: 'Akola',
      rating: 5,
      stayType: 'Engagement Ceremony',
      comment: 'We hosted our sister’s engagement in the AC Banquet Hall. The decor, sound system, and catering service were seamless. Guest feedback was 10/10.',
      date: 'October 2026'
    },
    {
      id: 'rev-4',
      name: 'Nitin Kulkarni',
      city: 'Mumbai',
      rating: 5,
      stayType: 'Corporate Retreat',
      comment: 'The perfect balance of work and nature. We organized a 2-day corporate brainstorming session. Fast Wi-Fi, peaceful environment, and fabulous service.',
      date: 'September 2026'
    }
  ];

  const fullData = {
    admins: [
      {
        id: 'admin-01',
        email: 'admin@sadgururesort.com',
        passwordHash: adminPasswordHash,
        name: 'Sadguru General Manager',
        role: 'SuperAdmin',
        createdAt: new Date().toISOString()
      }
    ],
    rooms,
    packages,
    bookings: sampleBookings,
    poolBookings,
    banquetBookings,
    lawnBookings,
    packageBookings: [],
    inquiries: [
      {
        id: 'INQ-0001',
        name: 'Gaurav Jadhav',
        email: 'gaurav.j@gmail.com',
        phone: '+91 97654 32100',
        subject: 'Banquet Hall for 350 Guests',
        message: 'Hello, looking for availability and food menu packages for December 15th wedding.',
        status: 'Unread',
        createdAt: new Date().toISOString()
      }
    ],
    reviews,
    settings: {
      resortName: 'Sadguru Resort',
      tagline: 'Where luxury meets tranquillity.',
      phone: '+91 98220 11223',
      alternatePhone: '+91 94221 44556',
      whatsapp: '+91 98220 11223',
      email: 'contact@sadgururesort.com',
      adminEmail: 'admin@sadgururesort.com',
      address: 'Near Dnyaneshwar Mandir, Jalamb Road, Shegaon - 444203, Maharashtra, India',
      poolTimings: '06:00 AM - 09:00 PM',
      checkInTime: '01:00 PM',
      checkOutTime: '11:00 AM',
      adultPoolTicket: 350,
      childPoolTicket: 200,
      banquetCapacity: 500,
      lawnAreaSqFt: '25,000+ sq.ft',
      taxPercentage: 12
    }
  };

  const dbDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(fullData, null, 2), 'utf-8');
  console.log(`Database successfully seeded at: ${DB_FILE}`);
  console.log(`- 9 Luxury Rooms (7 Deluxe AC, 2 Deluxe Family)`);
  console.log(`- 8 Resort Packages`);
  console.log(`- 1 Admin: admin@sadgururesort.com / Admin@123`);
  console.log(`- Sample bookings and reviews initialized.`);
};

seedData().catch(err => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
