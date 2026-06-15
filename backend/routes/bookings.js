const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingById, processPayment, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All booking operations require authentication

router.post('/', createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBookingById);
router.post('/pay', processPayment);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
