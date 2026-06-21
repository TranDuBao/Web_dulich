const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingById, processPayment, cancelBooking, getAllBookings } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect); // All booking operations require authentication

router.post('/', createBooking);
router.get('/', getMyBookings);
router.get('/all', admin, getAllBookings); // Admin-only: list all bookings
router.get('/:id', getBookingById);
router.post('/pay', processPayment);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
