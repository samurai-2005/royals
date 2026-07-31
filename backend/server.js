const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const shiprocketRoutes = require('./src/routes/shiprocketRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
// FIXED: set 'origin: true' so all Vercel preview URLs and localhost are permitted
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});