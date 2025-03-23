
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Booking = require("./models/Booking");

const app = express();
const PORT = 5000;
const JWT_SECRET = "your-super-secret-key";

app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(
  "mongodb+srv://mubarikhammad:dtm82Jc9g4lwjdeZ@parking.74j5l.mongodb.net/?retryWrites=true&w=majority&appName=parking",
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB error:", err));

// Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ success: false, message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "Error signing up" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: "Error logging in" });
  }
});

// Slots (in-memory for now)
let slotsDB = {
  "2025-03-20": { "08:00 AM": ["A1", "A2", "A3"], "10:00 AM": ["B1", "B2"] },
  "2025-03-21": { "12:00 PM": ["C1", "C2", "C3"], "02:00 PM": ["D1", "D2"] }
};

app.get("/slots", (req, res) => {
  const { date, time } = req.query;
  const slots = slotsDB[date]?.[time] || [];
  res.json({ slots });
});

// Book slot
app.post("/book", async (req, res) => {
  const { date, time, slot, userEmail } = req.body;
  try {
    const existing = await Booking.findOne({ date, time, slot });
    if (existing) return res.json({ success: false, message: "Slot already booked." });
    const booking = new Booking({ userEmail, date, time, slot });
    await booking.save();
    if (slotsDB[date] && slotsDB[date][time]) {
      slotsDB[date][time] = slotsDB[date][time].filter(s => s !== slot);
    }
    res.json({ success: true, message: `Slot ${slot} booked.` });
  } catch (error) {
    res.json({ success: false, message: "Booking failed." });
  }
});

app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
