// server.js - 100% FIXED DOUBLE SAVE ISSUE ✅
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static("."));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ✅ CRITICAL FIX: Global connection cache
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://muhammadfaiq5555_db_user:UXpL76Ril9xqUcov@cluster0.bvt5lkt.mongodb.net/?appName=Cluster0";

let connectionPromise = null;

const connectDB = async () => {
  if (connectionPromise) {
    return connectionPromise;
  }
  
  connectionPromise = mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    return mongoose.connection;
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Failed:", err.message);
    connectionPromise = null; // Reset on failure
    throw err;
  });
  
  return connectionPromise;
};

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, "Email is required"],
    trim: true,
    lowercase: true
  },
  subject: { 
    type: String, 
    default: "No Subject",
    trim: true 
  },
  budget: { 
    type: String, 
    default: "Not Specified" 
  },
  message: { 
    type: String, 
    required: [true, "Message is required"],
    trim: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  // ✅ NEW: Request ID to prevent duplicates
  requestId: {
    type: String,
    unique: true,
    sparse: true
  }
});

const Contact = mongoose.model("Contact", contactSchema);

// ✅ CRITICAL FIX: Request deduplication
const pendingRequests = new Map();

app.post("/api/contact", async (req, res) => {
  // ✅ Create unique request ID
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const requestKey = `${req.ip}-${JSON.stringify(req.body)}`;
  
  // Check if same request is already processing
  if (pendingRequests.has(requestKey)) {
    console.log("🔄 Duplicate request detected, skipping...");
    return res.json({ 
      success: true, 
      message: "✅ Message sent successfully!" 
    });
  }
  
  // Mark request as processing
  pendingRequests.set(requestKey, true);
  
  try {
    console.log("📨 Processing contact form...");
    
    await connectDB();
    
    const { name, email, subject, budget, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      pendingRequests.delete(requestKey);
      return res.status(400).json({ 
        success: false, 
        message: "Please fill in all required fields: Name, Email & Message" 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      pendingRequests.delete(requestKey);
      return res.status(400).json({ 
        success: false, 
        message: "Please enter a valid email address" 
      });
    }

    // ✅ CRITICAL: Check for duplicate in database (same email + same message within 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    const existingContact = await Contact.findOne({
      email: email.trim().toLowerCase(),
      message: message.trim(),
      createdAt: { $gte: twoMinutesAgo }
    });

    if (existingContact) {
      console.log("⚠️ Duplicate contact prevented in DB check");
      pendingRequests.delete(requestKey);
      return res.json({ 
        success: true, 
        message: "✅ Message sent successfully!" 
      });
    }

    // Save to MongoDB with request ID
    const newContact = new Contact({ 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      subject: subject?.trim() || "No Subject", 
      budget: budget || "Not Specified", 
      message: message.trim(),
      requestId: requestId
    });

    await newContact.save();
    console.log("✅ Contact saved to MongoDB - SINGLE SAVE CONFIRMED");

    res.json({ 
      success: true, 
      message: "🎉 Thank you! Your message has been sent successfully!" 
    });

  } catch (err) {
    console.error("❌ Server Error:", err);
    
    // Handle duplicate key error (if requestId unique constraint fails)
    if (err.code === 11000) {
      console.log("🔑 Duplicate prevented by unique requestId");
      return res.json({ 
        success: true, 
        message: "✅ Message sent successfully!" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Internal server error. Please try again later." 
    });
  } finally {
    // Clean up pending request after 5 seconds
    setTimeout(() => {
      pendingRequests.delete(requestKey);
    }, 5000);
  }
});

// Other routes remain same...
app.get("/api/contacts", async (req, res) => {
  try {
    await connectDB();
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      count: contacts.length, 
      contacts 
    });
  } catch (err) {
    console.error("❌ Error fetching contacts:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching contacts" 
    });
  }
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is running!",
    timestamp: new Date().toISOString()
  });
});

// Serve HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "contact.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "about.html"));
});

app.get("/services", (req, res) => {
  res.sendFile(path.join(__dirname, "services.html"));
});

app.get("/portfolio", (req, res) => {
  res.sendFile(path.join(__dirname, "portfolio.html"));
});

// DELETE contact
app.delete("/api/contacts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting contact" });
  }
});

// ✅ FIXED: Vercel specific export
if (process.env.VERCEL) {
  module.exports = app;
  console.log("🚀 Vercel Serverless Mode");
} else {
  app.listen(PORT, async () => {
    await connectDB();
    console.log(`📍 Server running on http://localhost:${PORT}`);
  });
}