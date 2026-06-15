const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root API welcome/healthcheck
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Travel Portal API Gateway!' });
});

// Register routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tours', require('./routes/tours'));
app.use('/api/suppliers', require('./routes/hotelFlights'));
app.use('/api/itineraries', require('./routes/itineraries'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ không mong muốn!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
