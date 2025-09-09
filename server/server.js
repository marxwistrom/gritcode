const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { MongoClient } = require('mongodb');  // Add this import

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


const app = express();

// Essential middleware
app.use(cors({
    origin: 'http://127.0.0.1:3000', // Update this to match your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../src')));
app.use('/styles', express.static(path.join(__dirname, '../src/styles')));


// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/memories', {
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Memory = mongoose.model('Memory', memorySchema);

// Validation middleware
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

// Routes
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

// Get all memories (optional)
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/index.html'));
});



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Global promise rejection handler
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
});
