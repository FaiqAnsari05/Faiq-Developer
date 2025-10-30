// server.js - WITH MONGODB
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// MONGODB CONNECTION - CHOOSE ONE OPTION BELOW

// OPTION 1: Local MongoDB (if you installed MongoDB locally)
// const MONGODB_URI = 'mongodb://localhost:27017/faiqportfolio';

// OPTION 2: MongoDB Atlas (Cloud - Recommended)
// Replace with your actual Atlas connection string
const MONGODB_URI = mongoose.connect('mongodb+srv://faiqdeveloper:2EXcDu5877NqAnTd@m0.id5mhfg.mongodb.net/');

console.log('🔗 Connecting to MongoDB...');

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ Connected to MongoDB successfully!');
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Using in-memory storage as fallback...');
});

// Contact Schema
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: String,
    budget: String,
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// Fallback in-memory storage if MongoDB fails
let fallbackContacts = [];
let fallbackId = 1;

// TEST endpoint
app.get('/api/test', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    res.json({ 
        success: true, 
        message: `Server working! MongoDB: ${dbStatus}`,
        time: new Date().toLocaleString()
    });
});

// CONTACT endpoint with MongoDB
app.post('/api/contact', async (req, res) => {
    console.log('📨 Contact form received:', req.body);
    
    try {
        const { name, email, subject, budget, message } = req.body;
        
        // Validation
        if (!name || !email || !message) {
            return res.json({ 
                success: false, 
                message: 'Please fill in name, email, and message.' 
            });
        }

        // Try MongoDB first
        if (mongoose.connection.readyState === 1) {
            // Save to MongoDB
            const newContact = new Contact({
                name: name.trim(),
                email: email.trim(),
                subject: subject?.trim() || 'No subject',
                budget: budget || 'Not specified',
                message: message.trim()
            });

            await newContact.save();
            console.log('✅ Contact saved to MongoDB!');
            
            res.json({ 
                success: true, 
                message: '🎉 Thank you! Your message has been saved to database!',
                storage: 'mongodb'
            });
        } else {
            // Fallback to memory storage
            const fallbackContact = {
                id: fallbackId++,
                name: name.trim(),
                email: email.trim(),
                subject: subject?.trim() || 'No subject',
                budget: budget || 'Not specified',
                message: message.trim(),
                timestamp: new Date().toLocaleString(),
                storage: 'memory'
            };

            fallbackContacts.push(fallbackContact);
            console.log('⚠️ Contact saved to memory (MongoDB not available)');
            
            res.json({ 
                success: true, 
                message: '🎉 Thank you! Your message has been sent! (Using temporary storage)',
                storage: 'memory'
            });
        }
        
    } catch (error) {
        console.error('❌ Error saving contact:', error);
        res.json({ 
            success: false, 
            message: 'Sorry, there was an error. Please try again.' 
        });
    }
});

// View contacts - from MongoDB or memory
app.get('/api/contacts', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            // Get from MongoDB
            const contacts = await Contact.find().sort({ createdAt: -1 });
            res.json({
                success: true,
                storage: 'mongodb',
                count: contacts.length,
                contacts: contacts
            });
        } else {
            // Get from memory
            res.json({
                success: true,
                storage: 'memory',
                count: fallbackContacts.length,
                contacts: fallbackContacts
            });
        }
    } catch (error) {
        res.json({
            success: false,
            message: 'Error retrieving contacts'
        });
    }
});

// Serve HTML files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

// Start server
app.listen(PORT, () => {
    console.log('✨✨✨ SERVER STARTED ✨✨✨');
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📧 Contact form: http://localhost:${PORT}/contact.html`);
    console.log(`🛠️  Test: http://localhost:${PORT}/api/test`);
    console.log(`📋 View data: http://localhost:${PORT}/api/contacts`);
});