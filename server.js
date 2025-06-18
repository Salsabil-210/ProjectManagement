const express = require('express');
const https = require("https");
require('dotenv').config();
const app = express();
const server = https.createServer(app);

// Import database connection
const db = require('./config/database');

// Import security middleware
const { 
    loginLimiter, 
    registerLimiter, 
    apiLimiter, 
    corsOptions, 
    securityHeaders 
} = require('./middleware/security');

// Import authentication middleware
const { authenticateToken } = require('./middleware/authmiddleware');


// Apply security middleware
app.use(securityHeaders);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test database connection
async function testDatabaseConnection() {
    try {
        const result = await db.query('SELECT NOW()');
        console.log('✅ PostgreSQL Database connected successfully!');
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL Database connection failed:', error.message);
        return false;
    }
}

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Task Management API is running!',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found"
    });
});

// Server setup with database connection
const PORT = process.env.PORT || 3000;

async function startServer() {
    // Test database connection first
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
        console.error('❌ Cannot start server without database connection');
        process.exit(1);
    }
    
    // Start server only if database is connected
    server.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

startServer();
