# Sadguru Resort — Premium Hospitality & Booking Platform

> **"Where luxury meets tranquillity. Experience unforgettable moments surrounded by nature. Relax, celebrate and create beautiful memories. Your perfect destination for comfort and celebrations."**

---

## 🌟 Executive Summary

**Sadguru Resort** is a comprehensive, production-grade, modern luxury resort website and booking engine located in Shegaon, Maharashtra. Built with a bespoke design system (Cream, Beige, Olive Green, Earthy Brown, and Muted Gold), the platform incorporates a full frontend experience, robust backend APIs, concurrency-protected room inventory management, customer self-service tracking, and a secure administration dashboard.

---

## 🎨 Design & Visual Identity

- **Palette**:
  - **Cream**: `#FAF7F2` (Soft natural canvas)
  - **Beige**: `#EFE8DC` / `#E2D7C3` (Warm hospitality stone)
  - **Olive Green**: `#263628` / `#182319` (Forest serenity)
  - **Earthy Brown**: `#5A422D` (Organic warmth)
  - **Muted Gold**: `#C5A059` (Royal hospitality accents)
  - **White**: `#FFFFFF` (Crisp contrast)
- **Typography**:
  - Headings: *Cormorant Garamond* & *Cinzel* (Royal, elegant serif)
  - Body: *Plus Jakarta Sans* (Clean, modern legibility)
- **Visuals**: Curated high-resolution imagery, subtle micro-animations, smooth scrolling, and glassmorphism headers.

---

## 🚀 Key Modules & Architecture

### 1. Premium Loading Screen
- Animated emblem with Sadguru Resort royal monogram (`SR`).
- Center heading with gold gradient text and progress indicator (`0%` to `100%`).
- Smooth fade-in and transition into the homepage.

### 2. Homepage Hero Section
- Center heading: **SADGURU RESORT**
- Exact 4-line poetic description:
  > *"Where luxury meets tranquillity.*  
  > *Experience unforgettable moments surrounded by nature.*  
  > *Relax, celebrate and create beautiful memories.*  
  > *Your perfect destination for comfort and celebrations."*
- Call-to-action buttons: **Book Your Stay** and **Explore Our Facilities**.
- Floating **Real-Time Room Availability Search Bar** (Check-in, Check-out, Guests, Category).

### 3. Accommodation & Concurrency-Protected Room Booking
- **Total Room Inventory**: Exactly **9 Luxury Rooms**:
  - **Deluxe AC Rooms (7 rooms)**: Rooms 101, 102, 103, 104, 105, 106, 107 (₹3,499/night, capacity 3, complimentary pool access).
  - **Deluxe Family Suites (2 rooms)**: Rooms 201, 202 (₹5,999/night, capacity 6, 2 king beds, living room, pool access).
- **Backend Conflict & Overlap Prevention**:
  - Real-time date interval overlap evaluation: `(startA < endB) && (endA > startB)`.
  - In-process mutex transaction lock prevents race conditions during simultaneous booking submissions.
  - Room cancellation instantly returns the unit to public availability.
  - Dynamic availability calendar check before room booking confirmation.
  - Multi-step booking wizard with instant printable/downloadable voucher receipt and Booking Reference ID (`SR-RM-2026-XXXX`).

### 4. Luxurious Swimming Pool
- Olympic-styled horizon swimming pool with ozone purification.
- Separate toddler splash pool with safety floaters.
- Operating hours: **06:00 AM – 09:00 PM**.
- **Resort Guest Policy**: In-house room guests receive **100% Complimentary Swimming Pool Access**.
- **Separate Pool Pass Booking**: For day visitors (Adults: ₹350, Children: ₹200) with time slot reservations.

### 5. Luxurious Banquet Hall ("Celebrate Your Special Moments")
- 500+ capacity, fully air-conditioned, pillarless grand hall.
- Suitable occasions: Birthday Parties, Engagement Ceremonies, Wedding Functions, Corporate Events.
- Interactive booking & quotation form with slot conflict prevention.

### 6. Green Lush Lawn ("Celebrate Amidst Nature")
- 25,000+ sq.ft manicured emerald outdoor lawn.
- Fairy-light palm tree illumination, wedding mandap setup, DJ sound stage, drone photography permits.
- Event booking system preventing double reservations.

### 7. Resort Packages (All 8 Manageable from Admin)
1. **Couple Stay Package** (₹5,999) — Romantic suite decor, poolside candlelight dinner, complimentary pool access.
2. **Family Stay Package** (₹9,999) — Deluxe family suite for 4-6, buffet meals, lawn games.
3. **Day Outing Package** (₹1,499) — Pool access, lunch buffet, high tea.
4. **Swimming Pool Package** (₹799) — 4-hour pool slot, mocktail, towels, snacks.
5. **Birthday Celebration Package** (₹14,999) — Private cabana decor, 1.5kg cake, music, snacks for 15.
6. **Corporate Event Package** (₹24,999) — AC Banquet Hall, projector, audio, business lunch.
7. **Wedding Celebration Package** (₹95,000) — 24-hr exclusive lawn & banquet access, mandap, 4 Deluxe AC rooms.
8. **Weekend Getaway Package** (₹7,999) — 2 Nights / 3 Days Deluxe AC stay, pool access, breakfast.

### 8. Customer Self-Service Booking Tracker
- Customers enter **Booking ID** (`SR-RM-XXXX`) and **Mobile Number**.
- View real-time status: `Confirmed`, `Pending`, `Cancelled`, `Completed`.
- Print or re-download official booking voucher.
- Self-service cancellation releasing inventory back to the resort.

### 9. Secure Administration Dashboard (`/admin`)
- **Authentication**: JWT token verification, bcrypt hashed passwords.
  - **Email**: `admin@sadgururesort.com`
  - **Password**: `Admin@123`
- **Dashboard Overview**:
  - Total Bookings, Today's Check-ins, Tomorrow's Check-ins, Upcoming, Cancelled.
  - Total Revenue, Pending Balance at check-in.
  - Real-time room occupancy mini-grid (Available vs Occupied vs Under Maintenance).
  - Day-wise (last 7 days) and monthly revenue reports.
- **Booking Management**:
  - Filter by date range, quick filters (Today, Tomorrow, Upcoming, Past).
  - Filter by room category, booking status, and payment status.
  - Update status, cancel reservation, update payment status.
  - **One-click Export to CSV Report**.
- **Room Management (All 9 Rooms)**:
  - Toggle maintenance block on/off (instantly closes or reopens room).
  - Edit nightly rates dynamically.
- **Facility Management**:
  - Swimming pool visitor passes, banquet reservations, lawn bookings, and package prices.
- **Resort Settings**:
  - Manage contact numbers, address, pool tickets, and tax percentages.

### 10. Additional Website Sections
- About Sadguru Resort (Heritage & Architecture).
- World-Class Facilities (24/7 dining, valet parking, dual generator backup, high-speed Wi-Fi, kids zone).
- Photo Gallery (Filterable categories + full-screen Lightbox).
- Verified Guest Reviews & Testimonials.
- Location & Proximity (Google Maps, Shegaon Temple 2.8 km, Railway Station 3.2 km).
- Frequently Asked Questions (Accordion FAQs).
- Contact Us (Direct message form, Hotline, WhatsApp quick chat, address).
- Comprehensive Footer with quick navigation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 6, Tailwind CSS 3.4, Framer Motion, Lucide Icons, Canvas Confetti, React Router DOM |
| **Backend** | Node.js (v24), Express.js 4.21, CORS, Morgan logger, JSON Web Token (JWT), Dotenv |
| **Database** | ACID Transactional JSON/SQLite file engine with in-process mutex locking & atomic swap writes |
| **Security** | bcrypt password hashing (10 salt rounds), JWT Bearer auth, input sanitization |

---

## 📁 Directory Structure

```text
sadguru-resort/
├── package.json               # Root scripts
├── README.md                  # Comprehensive documentation
├── backend/
│   ├── package.json           # Backend dependencies
│   ├── server.js              # Express API & SPA static server
│   ├── test-suite.js          # Automated end-to-end test suite
│   ├── config/
│   │   └── constants.js       # App configuration, JWT secret & ports
│   ├── database/
│   │   ├── db.js              # Mutex lock, ACID queries & conflict engine
│   │   ├── seed.js            # Initial 9 rooms, 8 packages, admin & reviews
│   │   └── data.json          # Persisted database store
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   ├── poolController.js
│   │   ├── banquetController.js
│   │   ├── lawnController.js
│   │   ├── packageController.js
│   │   ├── adminController.js
│   │   └── contactController.js
│   ├── routes/                # Modular REST route handlers
│   └── middleware/
│       └── authMiddleware.js  # JWT validation
└── frontend/
    ├── package.json           # Frontend dependencies
    ├── vite.config.js         # Vite configuration with /api proxy
    ├── tailwind.config.js     # Custom luxury resort color palette
    ├── index.html             # Google fonts & meta tags
    └── src/
        ├── App.jsx            # React Router routes
        ├── index.css          # Tailwind & luxury gold styles
        ├── services/
        │   └── api.js         # Unified API client
        ├── pages/
        │   ├── HomePage.jsx       # Complete resort experience
        │   ├── AdminLogin.jsx     # Secure authentication
        │   └── AdminDashboard.jsx # Full management console
        └── components/        # Modular UI components
```

---

## 💻 How to Run the Application

### 1. Start the Unified Server (Frontend + Backend)
The production bundle is already built and ready in `frontend/dist`. Run:

```bash
cd C:\Users\nihal\.gemini\antigravity\scratch\sadguru-resort
npm start
```
The application will launch on **`http://localhost:5000`**:
- **Website**: `http://localhost:5000`
- **Admin Login**: `http://localhost:5000/admin/login`
- **API Health**: `http://localhost:5000/api/health`

### 2. Development Mode (Hot Reload)
To run frontend and backend in active development mode:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend with Vite HMR):**
```bash
cd frontend
npm run dev
```
Open Vite dev server at **`http://localhost:3000`**.

### 3. Run Automated Tests
```bash
cd backend
npm test
```
Verifies room inventory (9 rooms), conflict rejection (409 Conflict), swimming pool bookings, admin authentication, stats generation, and SPA delivery.

---

## 🔐 Admin Credentials

- **URL**: `http://localhost:5000/admin/login`
- **Email**: `admin@sadgururesort.com`
- **Password**: `Admin@123`
- *Note: Passwords are encrypted using bcrypt and can be changed from the admin dashboard.*
