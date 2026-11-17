
// Import required packages
const express = require('express');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import routes and error handler
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');

// Create Express application
const app = express();

// Middleware to read JSON data
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Inventory Management API is running'
    });
});

// Product routes
app.use('/api/products', productRoutes);

// Centralized error handling
app.use(errorHandler);

// Start server after database connection
const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log('Database connection failed:', error.message);
        process.exit(1);
    });

