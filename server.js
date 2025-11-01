// server.js - COMPLETE WORKING VERSION
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('.'));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ✅ FIX: Favicon route - ADD THIS
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔗 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.log('❌ MongoDB Error:', err.message);
    console.log('💡 Using in-memory storage');
  });

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  budget: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// In-memory fallback
let contacts = [];
let contactId = 1;

// Contact Route
app.post('/api/contact', async (req, res) => {
  try {
    console.log('📨 Contact form received');
    
    const { name, email, subject, budget, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      const newContact = new Contact({
        name: name.trim(),
        email: email.trim(),
        subject: subject || 'No Subject',
        budget: budget || 'Not Specified',
        message: message.trim()
      });

      await newContact.save();
      console.log('✅ Saved to MongoDB');

      return res.json({
        success: true,
        message: 'Thank you! Your message has been sent successfully!',
        storage: 'mongodb'
      });
    } else {
      // Fallback to memory
      const memoryContact = {
        id: contactId++,
        name: name.trim(),
        email: email.trim(),
        subject: subject || 'No Subject',
        budget: budget || 'Not Specified',
        message: message.trim(),
        timestamp: new Date().toISOString(),
        storage: 'memory'
      };

      contacts.push(memoryContact);
      console.log('💾 Saved to memory');

      return res.json({
        success: true,
        message: 'Thank you! Your message has been sent!',
        storage: 'memory'
      });
    }

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get contacts
app.get('/api/contacts', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbContacts = await Contact.find().sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: dbContacts.length,
        contacts: dbContacts,
        storage: 'mongodb'
      });
    } else {
      return res.json({
        success: true,
        count: contacts.length,
        contacts: contacts,
        storage: 'memory'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching contacts'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'services.html'));
});

app.get('/portfolio', (req, res) => {
  res.sendFile(path.join(__dirname, 'portfolio.html'));
});

// Serve other files with error handling
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // If file doesn't exist, send 404
    res.status(404).send('Page not found');
  }
});

module.exports = app;
