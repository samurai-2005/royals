// 1. MUST be required before any other module
require('./instrument.js');

// 2. Load environment variables IMMEDIATELY so process.env is ready for all imported modules
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const Sentry = require('@sentry/node');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const shiprocketRoutes = require('./src/routes/shiprocketRoutes');

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json()); // Parses incoming JSON payloads

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shiprocket', shiprocketRoutes);

// Make the uploads folder statically accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoints
app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'Healthy', 
    uptime: process.uptime(),
    timestamp: new Date() 
  });
});

app.get('/', (req, res) => {
  res.send('The Royal Tailor API is running...');
});


// 3. Sentry Error Handler MUST be registered AFTER all routes and controllers
Sentry.setupExpressErrorHandler(app);

// 4. Fallthrough Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});