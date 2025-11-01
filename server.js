// server.js - 100% WORKING GUARANTEED
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static("."));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err.message));

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: String, email: String, subject: String, budget: String, message: String,
  createdAt: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", contactSchema);

// ✅ FIXED ROUTES - Ye zaroor add karo
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

// API Routes
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, budget, message } = req.body;
    if (!name || !email || !message) {
      return res.json({ success: false, message: "All fields required" });
    }
    const newContact = new Contact({ name, email, subject, budget, message });
    await newContact.save();
    res.json({ success: true, message: "✅ Message sent successfully!" });
  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
});

app.get("/api/contacts", async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json({ success: true, count: contacts.length, contacts });
});

// Serve other files
app.get("*", (req, res) => {
  const filePath = path.join(__dirname, req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Page not found");
  }
});

// Export for Vercel
module.exports = app;

// Server start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Contact: http://localhost:${PORT}/contact`);
  console.log(`🏠 Home: http://localhost:${PORT}`);
});
