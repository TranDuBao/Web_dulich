const express = require('express');
const router = express.Router();
const { getTours, getTourById, createTour, updateTour, deleteTour } = require('../controllers/tourController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getTours);
router.get('/:id', getTourById);
router.post('/', protect, admin, createTour);
router.put('/:id', protect, admin, updateTour);
router.delete('/:id', protect, admin, deleteTour);

module.exports = router;
