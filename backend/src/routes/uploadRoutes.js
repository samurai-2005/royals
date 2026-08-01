const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Verify Cloudinary Config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.error('Cloudinary Env Variables missing on Render!');
      return res.status(500).json({ message: 'Cloudinary environment variables not configured on server.' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'royal_tailors_products' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Stream Error:', error);
          return res.status(500).json({ message: error.message || 'Cloudinary upload failed' });
        }
        res.status(200).send(result.secure_url);
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('Upload Route Catch Error:', error);
    res.status(500).json({ message: error.message || 'Server upload error' });
  }
});

module.exports = router;