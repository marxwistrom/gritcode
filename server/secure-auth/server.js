// server.js - Complete server with security and memory functionality
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { MongoClient } = require('mongodb');

// Import User model
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB client for logging
const client = new MongoClient('mongodb://127.0.0.1:27017');

async function saveToTestDB(logMessage) {
    try {
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("dummy");
        await collection.insertOne({
            message: logMessage,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error saving to test database:', error);
    } finally {
        await client.close();
    }
}

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS configuration for both development and production
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://127.0.0.1:4000',
            'http://localhost:4000',
            process.env.FRONTEND_ORIGIN
        ].filter(Boolean); // Remove undefined values

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const loginLimiter = rateLimit({
    windowMs: 15*60*1000, // 15 minutes
    max: 12,
    message: { message: 'För många inloggningsförsök' }
});

// Static file serving
app.use(express.static(path.join(__dirname, '../../src')));
app.use('/styles', express.static(path.join(__dirname, '../../src/styles')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Memory Schema
const memorySchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    story: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: false // Optional for now, can be made required later
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Memory = mongoose.model('Memory', memorySchema);

// Validation middleware for memories
const validateMemory = (req, res, next) => {
    const { date, place, title, story } = req.body;
    if (!date || !place || !title || !story) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    next();
};

// Auth middleware (hämtar token från HttpOnly cookie)
function authMiddleware(req, res, next) {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Inte autentiserad' });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // innehåller userId och role
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Ogiltig eller utgången token' });
    }
}

// Login endpoint with secure authentication
app.post('/api/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    try {
        // Try secure authentication first
        const user = await User.findOne({ username: email }).exec();

        if (user) {
            // Secure user authentication
            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok) {
                return res.status(401).json({
                    success: false,
                    message: 'Fel användarnamn eller lösenord'
                });
            }

            const token = jwt.sign({
                userId: user._id.toString(),
                role: user.role,
                email: user.username
            }, process.env.JWT_SECRET, { expiresIn: '15m' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15*60*1000
            });

            return res.json({
                success: true,
                message: 'Login successful',
                user: { name: user.username, role: user.role }
            });
        }

        // Fallback to basic validation if user not found in secure DB
        const validUsers = [
            { email: 'admin@test.com', password: 'AdminSecure2025!', name: 'Admin User', role: 'admin' },
            { email: 'user@test.com', password: 'UserSecure2025!', name: 'Regular User', role: 'user' },
            { email: 'demo@test.com', password: 'DemoSecure2025!', name: 'Demo User', role: 'user' }
        ];

        const basicUser = validUsers.find(u => u.email === email && u.password === password);

        if (basicUser) {
            // Create session-based auth for basic users
            const token = jwt.sign({
                userId: 'basic_' + Date.now(),
                role: basicUser.role,
                email: basicUser.email
            }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60*60*1000 // 1 hour for basic users
            });

            return res.json({
                success: true,
                message: 'Login successful',
                user: { name: basicUser.name, role: basicUser.role }
            });
        }

        res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Memory endpoints
app.post('/api/e', validateMemory, async (req, res) => {
    try {
        await saveToTestDB('Received memory: ' + JSON.stringify(req.body));

        const memory = new Memory(req.body);
        const savedMemory = await memory.save();

        await saveToTestDB('Saved memory: ' + JSON.stringify(savedMemory));

        res.status(201).json({
            success: true,
            message: 'Memory saved successfully',
            data: savedMemory
        });
    } catch (error) {
        await saveToTestDB('Error saving memory: ' + error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to save memory',
            error: error.message
        });
    }
});

// Get all memories
app.get('/api/e', async (req, res) => {
    try {
        const memories = await Memory.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: memories
        });
    } catch (error) {
        console.error('Error fetching memories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch memories'
        });
    }
});

// Get user-specific memories (authenticated)
app.get('/api/memories', authMiddleware, async (req, res) => {
    try {
        const memories = await Memory.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: memories
        });
    } catch (error) {
        console.error('Error fetching user memories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch memories'
        });
    }
});

// Admin route
app.get('/admin', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Åtkomst nekad' });
    }
    res.json({
        success: true,
        msg: 'Välkommen admin!',
        user: req.user
    });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Verify authentication status
app.get('/api/auth/status', authMiddleware, (req, res) => {
    res.json({
        success: true,
        authenticated: true,
        user: {
            userId: req.user.userId,
            role: req.user.role,
            email: req.user.email
        }
    });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/index.html'));
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/login.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handlers
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

app.listen(PORT, () => {
    console.log(`🚀 Secure Server running on http://localhost:${PORT}`);
    console.log(`📊 MongoDB connected and ready`);
    console.log(`🔐 JWT Authentication enabled`);
    console.log(`🛡️  Security middleware active`);
});
