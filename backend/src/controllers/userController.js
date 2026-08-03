const RawUser = require('../models/User');
const User = RawUser.default || RawUser;
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');

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

// Helper: Always send OTP to Registered Email Inbox (Resend API -> Zoho SMTP -> Console Fallback)
const dispatchOTP = async ({ email, phone, otp }) => {
  console.log(`\n🔑 [OTP GENERATED] -> Code: ${otp} | Sent to Email: ${email} (Linked Mobile: ${phone || 'N/A'})\n`);

  // 1. Try Resend API (Primary)
  if (process.env.RESEND_API_KEY) {
    try {
      await axios.post(
        'https://api.resend.com/emails',
        {
          from: process.env.EMAIL_FROM || 'The Royal Tailor <onboarding@resend.dev>',
          to: [email],
          subject: 'Your Access OTP - The Royal Tailor Patna',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; background: #0f0f0f; color: #ffffff; border-radius: 12px; max-width: 500px; margin: 0 auto;">
              <h2 style="margin: 0 0 12px 0; letter-spacing: 1px;">THE ROYAL TAILOR</h2>
              <p style="color: #a1a1aa; font-size: 14px;">Your 6-digit verification code is:</p>
              <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #ffffff; background: #18181b; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 16px 0; border: 1px solid #27272a;">
                ${otp}
              </div>
              <p style="font-size: 12px; color: #71717a;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
            </div>
          `,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`✅ [RESEND SUCCESS] Email OTP delivered to ${email}`);
      return;
    } catch (resendErr) {
      console.warn('⚠️ [RESEND FAILED]:', resendErr.response?.data || resendErr.message);
    }
  }

  // 2. Try Zoho SMTP (Secondary)
  if (process.env.SMTP_HOST) {
    try {
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
            <p style="color: #a1a1aa; font-size: 14px;">Your 6-digit verification code is:</p>
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #ffffff; background: #18181b; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 16px 0; border: 1px solid #27272a;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #71717a;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
          </div>
        `,
      });
      console.log(`✅ [SMTP SUCCESS] Email OTP delivered to ${email}`);
      return;
    } catch (smtpErr) {
      console.warn('⚠️ [SMTP FAILED]:', smtpErr.message);
    }
  }

  console.warn(`⚠️ [DEV LOG ONLY] OTP code ${otp} generated for ${email}.`);
};

// @desc    Auth user & get token (Login via Password)
// @route   POST /api/users/login
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      $or: [{ email }, { phone: email }],
    });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isAdmin: user.role === 'admin' || user.isAdmin === true,
        isVerified: user.isVerified || false,
        isEmailVerified: user.isEmailVerified || false,
        isPhoneVerified: user.isPhoneVerified || false,
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
      return res.status(400).json({ message: 'Both Mobile Number and Email Address are strictly required to create an account.' });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (userExists) {
      return res.status(400).json({ message: 'User with this Email or Mobile Number already exists.' });
    }

    const otpCode = generate6DigitOTP();

    try {
      await dispatchOTP({ email, phone, otp: otpCode });
    } catch (mailError) {
      console.error('Email Dispatch Failed:', mailError);
      return res.status(500).json({ message: 'Failed to send OTP email. Please verify your email address.' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      isVerified: false,
      isEmailVerified: false,
      isPhoneVerified: false,
      otp: otpCode,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isAdmin: user.role === 'admin' || user.isAdmin === true,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      profilePicture: user.profilePicture,
      message: 'Account created! Verification OTP sent to your registered email.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check available OTP Delivery Channels (Defaults to Email)
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

    res.json({
      hasBoth: false,
      defaultChannel: 'email',
      email: user.email ? `${user.email.substring(0, 3)}***@***` : null,
      phone: user.phone ? `******${user.phone.slice(-4)}` : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send / Resend OTP (Always dispatches to user's registered email)
// @route   POST /api/users/send-otp
const sendOtp = async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: 'Account not found with this Mobile or Email.' });
    }

    const otpCode = generate6DigitOTP();

    await User.findByIdAndUpdate(user._id, {
      otp: otpCode,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await dispatchOTP({
      email: user.email,
      phone: user.phone,
      otp: otpCode,
    });

    res.json({ message: 'OTP sent successfully to your registered email inbox.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP Code & Mark Account as Verified
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

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $unset: { otp: 1, otpExpires: 1 },
        $set: {
          isVerified: true,
          isEmailVerified: true,
          isPhoneVerified: true,
        },
      },
      { returnDocument: 'after' }
    );

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      role: updatedUser.role,
      isAdmin: updatedUser.role === 'admin' || updatedUser.isAdmin === true,
      isVerified: updatedUser.isVerified,
      isEmailVerified: updatedUser.isEmailVerified,
      isPhoneVerified: updatedUser.isPhoneVerified,
      profilePicture: updatedUser.profilePicture,
      token: generateToken(updatedUser._id),
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
        phone: user.phone || '',
        role: user.role,
        isAdmin: user.role === 'admin' || user.isAdmin === true,
        isVerified: user.isVerified || false,
        isEmailVerified: user.isEmailVerified || false,
        isPhoneVerified: user.isPhoneVerified || false,
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
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;

      if (req.body.phone !== undefined && req.body.phone !== user.phone) {
        user.phone = req.body.phone;
        user.isPhoneVerified = false;
      }

      if (req.body.email !== undefined && req.body.email !== user.email) {
        user.email = req.body.email;
        user.isEmailVerified = false;
      }

      if (req.body.profilePicture !== undefined) {
        user.profilePicture = req.body.profilePicture;
      }

      user.isVerified = Boolean(user.isEmailVerified || user.isPhoneVerified);

      const updatedUser = await user.save();
      const existingToken = req.headers.authorization?.split(' ')[1] || generateToken(updatedUser._id);

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        role: updatedUser.role,
        isAdmin: updatedUser.role === 'admin' || updatedUser.isAdmin === true,
        isVerified: updatedUser.isVerified,
        isEmailVerified: updatedUser.isEmailVerified || false,
        isPhoneVerified: updatedUser.isPhoneVerified || false,
        profilePicture: updatedUser.profilePicture,
        token: existingToken,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({
        message: `This ${field} is already registered to another account.`,
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Save PWA Web Push Subscription for user
// @route   POST /api/users/subscribe-push
// @access  Public / Optional Auth
const savePushSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ message: 'Push subscription payload is required.' });
    }

    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { pushSubscription: subscription });
    }

    res.status(200).json({ message: 'Push notification subscription saved successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  savePushSubscription,
};