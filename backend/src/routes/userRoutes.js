const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  authUser,
  registerUser,
  updateUserProfile,
} = require('../controllers/userController');

// Standard Authentication Routes
router.post('/', registerUser);
router.post('/login', authUser);

// Protected Profile Route (Requires user to be logged in)
router.route('/profile').put(protect, updateUserProfile);

module.exports = router;