const express = require('express');
const router = express.Router();
const { getItineraries, getItineraryById, createItinerary, updateItinerary, deleteItinerary } = require('../controllers/itineraryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All itinerary operations require authentication

router.get('/', getItineraries);
router.get('/:id', getItineraryById);
router.post('/', createItinerary);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);

module.exports = router;
