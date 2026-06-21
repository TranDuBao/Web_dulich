const express = require('express');
const router = express.Router();
const { 
  getHotels, 
  getHotelById, 
  getFlights,
  createFlight,
  updateFlight,
  deleteFlight
} = require('../controllers/hotelFlightController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/hotels', getHotels);
router.get('/hotels/:id', getHotelById);
router.get('/flights', getFlights);

// Admin-only flight management routes
router.post('/flights', protect, admin, createFlight);
router.put('/flights/:id', protect, admin, updateFlight);
router.delete('/flights/:id', protect, admin, deleteFlight);

module.exports = router;
