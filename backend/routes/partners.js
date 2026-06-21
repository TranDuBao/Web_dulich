const express = require('express');
const router = express.Router();
const { 
  getPartnerHotels, createPartnerHotel, updatePartnerHotel, deletePartnerHotel,
  getHotelRooms, createRoom, updateRoom, deleteRoom,
  getPartnerBookings, updateBookingStatus, getPartnerStatistics 
} = require('../controllers/partnerController');
const { protect, hotelOwnerOrAdmin } = require('../middleware/authMiddleware');

router.use(protect, hotelOwnerOrAdmin);

// Hotels
router.get('/hotels', getPartnerHotels);
router.post('/hotels', createPartnerHotel);
router.put('/hotels/:id', updatePartnerHotel);
router.delete('/hotels/:id', deletePartnerHotel);

// Rooms
router.get('/hotels/:hotelId/rooms', getHotelRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// Bookings
router.get('/bookings', getPartnerBookings);
router.put('/bookings/:id', updateBookingStatus);

// Statistics
router.get('/statistics', getPartnerStatistics);

module.exports = router;
