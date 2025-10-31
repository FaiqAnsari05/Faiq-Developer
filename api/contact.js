import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

// Connect MongoDB (prevent multiple connections)
if (!global._mongoose) {
  global._mongoose = mongoose.connect(MONGO_URI);
}

// Create Schema
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const Contact = mongoose.models.Contact || mongoose.model("Contact", ContactSchema);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  const { name, email, message } = req.body;

  try {
    await global._mongoose;

    // Save data in DB
    await Contact.create({ name, email, message });

    return res.status(200).json({ success: true, message: "✅ Form saved to DB!" });
  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
