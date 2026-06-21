const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword, 
  getProfileStats, 
  getAllUsers, 
  updateUserRole, 
  deleteUser 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// User Profile management
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/profile-stats', protect, getProfileStats);

// Admin-only user management routes
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
