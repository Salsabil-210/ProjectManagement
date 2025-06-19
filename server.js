const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const db = require('./config/db');

// Import security middleware
const { 
    loginLimiter, 
    registerLimiter, 
    apiLimiter, 
    corsOptions, 
    securityHeaders 
} = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// Apply security middleware
app.use(securityHeaders);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/users/login', loginLimiter);
app.use('/api/users/register', registerLimiter);

// Enhanced database connection test
async function testDatabaseConnection() {
    try {
        const result = await db.query('SELECT NOW()');
        console.log('✅ PostgreSQL Database connected successfully!');
        
        // Verify tables exist
        const tablesCheck = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name IN ('users', 'projects', 'tasks')
        `);
        
        if (tablesCheck.rows.length < 3) {
            console.error('❌ Required tables are missing in the database');
            return false;
        }
        
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
        environment: process.env.NODE_ENV || 'development',
        database: 'PostgreSQL'
    });
});

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await db.query('SELECT 1');
        
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            database: 'disconnected',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Use auth routes
app.use('/api/users', authRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    // Handle database errors specifically
    if (err.code && err.code.startsWith('22') || err.code === '23505') {
        return res.status(400).json({
            success: false,
            message: 'Database validation error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found",
        path: req.path
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    console.log(`🔗 Database: PostgreSQL`);
});