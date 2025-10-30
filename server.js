// server.js - FOR VERCEL DEPLOYMENT
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// MongoDB Atlas Connection (Cloud)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/faiqportfolio';

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.log('❌ MongoDB error:', err.message));

// Contact Schema
const contactSchema = new mongoose.Schema({
    name: String, email: String, subject: String, budget: String, message: String,
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// Routes
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, budget, message } = req.body;
        if (!name || !email || !message) {
            return res.json({ success: false, message: 'All fields required' });
        }

        const newContact = new Contact({ name, email, subject, budget, message });
        await newContact.save();
        
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        res.json({ success: false, message: 'Server error' });
    }
});

app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Server working!' });
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

// Export for Vercel
module.exports = app;