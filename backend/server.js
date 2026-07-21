const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
// IMPORT THE NEW USER ROUTES
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

// Load environment variables
dotenv.config(); //[cite: 3]

// Connect to Database
connectDB(); //[cite: 3]

const app = express(); //[cite: 3]

// Middlewares
app.use(cors()); //[cite: 3]
app.use(express.json()); // Parses incoming JSON payloads[cite: 3]

// Mount Routes
app.use('/api/auth', authRoutes); //[cite: 3]
app.use('/api/products', productRoutes); //[cite: 3]
app.use('/api/upload', uploadRoutes); //[cite: 3]
// MOUNT THE NEW USER ROUTES
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Make the uploads folder statically accessible to the browser
// This is crucial for rendering uploaded product images in your frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); //[cite: 3]

// Health check endpoint
app.get('/', (req, res) => { //[cite: 3]
  res.send('The Royal Tailor API is running...'); //[cite: 3]
}); //[cite: 3]

const PORT = process.env.PORT || 5000; //[cite: 3]

app.listen(PORT, () => { //[cite: 3]
  console.log(`Server running in mode on port ${PORT}`); //[cite: 3]
}); //[cite: 3]