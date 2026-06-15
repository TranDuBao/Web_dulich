const express = require('express');
const router = express.Router();
const { getHotels, getHotelById, getFlights } = require('../controllers/hotelFlightController');

router.get('/hotels', getHotels);
router.get('/hotels/:id', getHotelById);
router.get('/flights', getFlights);

module.exports = router;
