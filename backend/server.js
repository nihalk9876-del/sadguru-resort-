const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const { PORT } = require('./config/constants');
const { connectMongo } = require('./database/mongodb');
const { initSocket } = require('./socket');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const poolRoutes = require('./routes/poolRoutes');
const banquetRoutes = require('./routes/banquetRoutes');
const lawnRoutes = require('./routes/lawnRoutes');
const packageRoutes = require('./routes/packageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const server = http.createServer(app);

// Initialize real-time Socket.IO
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Sadguru Resort Hospitality Engine'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/pool', poolRoutes);
app.use('/api/banquet', banquetRoutes);
app.use('/api/lawn', lawnRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Serve Frontend in Production Build
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Fallback to React index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Sadguru Resort API Server is Active. Frontend is running in dev or building.');
    }
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize MongoDB and Start Server
async function startServer() {
  await connectMongo();
  
  const listenPort = PORT || 5000;
  server.listen(listenPort, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`  SADGURU RESORT API & SOCKET.IO SERVER`);
    console.log(`  Live on: http://localhost:${listenPort}`);
    console.log(`  Admin Portal Protected with Authenticated Access`);
    console.log(`=================================================`);
  });
}

startServer();
