const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_key', {
    expiresIn: '30d',
  });
};

// Helper: Generate random 6-Digit OTP
const generate6DigitOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper: Send OTP via Custom Domain SMTP (Zoho / Webmail)
const dispatchOTP = async ({ email, phone, otp, channel }) => {
  if (channel === 'email' || !channel) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"The Royal Tailor Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Access OTP - The Royal Tailor Patna',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background: #0f0f0f; color: #ffffff; border-radius: 12px; max-width: 500px; margin: 0 auto;">
          <h2 style="margin: 0 0 12px 0; letter-spacing: 1px;">THE ROYAL TAILOR</h2>
          <p style="color: #a1a1aa; font-size: 14px;">Your 6-digit login verification OTP code is:</p>
          <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #ffffff; background: #18181b; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 16px 0; border: 1px solid #27272a;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #71717a;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
        </div>
      `,
    });
  } else if (channel === 'sms') {
    console.log(`[SMS GATEWAY] Sending OTP ${otp} to Mobile: ${phone}`);
  }
};

// @desc    Auth user & get token (Login via Password)
// @route   POST /api/users/login
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Search by either Email OR Phone
    const user = await User.findOne({
      $or: [{ email }, { phone: email }],
    });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.role === 'admin' || user.isAdmin === true,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email/phone or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user (Enforces BOTH Mobile & Email)
// @route   POST /api/users
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ message: 'Both Mobile Number and Email Address are strictly required.' });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (userExists) {
      return res.status(400).json({ message: 'User with this Email or Mobile Number already exists' });
    }

    const otpCode = generate6DigitOTP();

    // Send OTP first to ensure email dispatch works BEFORE creating user
    try {
      await dispatchOTP({ email, phone, otp: otpCode, channel: 'email' });
    } catch (mailError) {
      console.error('Email Dispatch Failed:', mailError);
      return res.status(500).json({ message: 'Failed to send OTP email. Please check your email address or try again.' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      otp: otpCode,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isAdmin: user.role === 'admin' || user.isAdmin === true,
      profilePicture: user.profilePicture,
      message: 'Account created! Verification OTP sent.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check available OTP Delivery Channels
// @route   POST /api/users/check-otp-channels
const checkOtpChannels = async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: 'Account not found with this Mobile or Email.' });
    }

    const hasBoth = Boolean(user.email && user.phone);
    const defaultChannel = identifier.includes('@') ? 'email' : 'sms';

    res.json({
      hasBoth,
      defaultChannel,
      email: user.email ? `${user.email.substring(0, 3)}***@***` : null,
      phone: user.phone ? `******${user.phone.slice(-4)}` : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send / Resend OTP to requested channel
// @route   POST /api/users/send-otp
const sendOtp = async (req, res) => {
  try {
    const { identifier, channel } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    const otpCode = generate6DigitOTP();
    user.otp = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    await dispatchOTP({
      email: user.email,
      phone: user.phone,
      otp: otpCode,
      channel: channel || 'email',
    });

    res.json({ message: `OTP sent successfully via ${channel === 'sms' ? 'Mobile SMS' : 'Email'}.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP Code & Issue Auth Token
// @route   POST /api/users/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid 6-digit OTP code.' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
    }

    // Clear OTP fields & Mark Verified
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isAdmin: user.role === 'admin' || user.isAdmin === true,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile (Sync on page load)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.role === 'admin' || user.isAdmin === true,
        profilePicture: user.profilePicture,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      
      if (req.body.profilePicture !== undefined) {
        user.profilePicture = req.body.profilePicture;
      }

      const updatedUser = await user.save();

      // Safely grab existing token or generate a fresh token
      const existingToken = req.headers.authorization?.split(' ')[1] || generateToken(updatedUser._id);

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isAdmin: updatedUser.role === 'admin' || updatedUser.isAdmin === true,
        profilePicture: updatedUser.profilePicture,
        token: existingToken,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  authUser,
  registerUser,
  checkOtpChannels,
  sendOtp,
  verifyOtp,
  getUserProfile,
  updateUserProfile,
};