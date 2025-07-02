const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const cookie = require('cookie-parser');
const SocketIo = require ('socket.io');
const fs = require('fs');
const https = require('https');
const http = require('http');

const { Server } = require('socket.io');

const {
    loginLimiter, 
    registerLimiter, 
    apiLimiter, 
    securityHeaders 
} = require('./middleware/security');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const authController = require('./controllers/authController');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); 

// NOTE: تم التعليق على إنشاء سيرفر HTTPS بسبب مشكلة في قراءة ملفات الشهادة (key.pem و cert.pem)
//ده عشان يقرا الملفات مشفره للسيكورتي
// const server = https.createServer({
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync('cert.pem')
// }, app);



const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected. Total:', io.engine.clientsCount);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


app.use(cookie());
app.use(securityHeaders);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/api/users/login', loginLimiter);
app.use('/api/users/register', registerLimiter);
app.use('/api/', apiLimiter);



async function testDatabaseConnection() {
    try {
        const result = await db.query('SELECT NOW()');
        console.log(' PostgreSQL Database connected successfully!');
        
        const tablesCheck = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name IN ('users', 'projects', 'tasks')
        `);
        
        if (tablesCheck.rows.length < 3) {
            console.error(' Required tables are missing in the database');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error(' PostgreSQL Database connection failed:', error.message);
        return false;
    }
}

app.get('/', (req, res) => {
    res.json({ 
        message: 'Task Management API is running!',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: 'PostgreSQL'
    });
});

app.get('/health', async (req, res) => {
    try {
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

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes); 
app.use('/api/tasks',taskRoutes);

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
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

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found",
        path: req.path
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(` Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});