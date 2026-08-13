require('dotenv').config(); // Load environment variables at the very top[cite: 25]
require('./instrument.js'); // Sentry instrumentation[cite: 25]

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

// Safely require saleRoutes if Flash Sales Persistence is used
let saleRoutes;
try {
  saleRoutes = require('./src/routes/saleRoutes');
} catch (err) {
  console.log('Note: saleRoutes file not present yet, skipping route mount.');
}

// Connect to Database[cite: 25]
connectDB();

const app = express();

// Middlewares[cite: 25]
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json()); // Parses incoming JSON payloads[cite: 25]

// Mount Routes[cite: 25]
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/logistics', shiprocketRoutes); // Bypasses keyword blocks[cite: 25]

if (saleRoutes) {
  app.use('/api/sales', saleRoutes);
}

// Make the uploads folder statically accessible[cite: 25]
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoints[cite: 25]
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

// Sentry Error Handler MUST be registered AFTER all routes and controllers[cite: 25]
Sentry.setupExpressErrorHandler(app);

// Fallthrough Error Handling Middleware[cite: 25]
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