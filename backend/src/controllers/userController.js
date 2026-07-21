const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate a secure JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Assuming you have a matchPassword method on your User model using bcrypt
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/users
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (Used for Profile Picture & Name)
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      // Update the profile picture if a new one is sent
      if (req.body.profilePicture !== undefined) {
        user.profilePicture = req.body.profilePicture;
      }

      const updatedUser = await user.save();
      
      // DIAGNOSTIC LOG: Watch your backend terminal when you upload a picture!
      console.log("✅ SAVED TO MONGODB - Profile Picture Path:", updatedUser.profilePicture);

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        token: req.headers.authorization.split(' ')[1], // Keep the user logged in with the same token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Save Error:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  authUser,
  registerUser,
  updateUserProfile,
};