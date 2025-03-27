
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
  "mongodb+srv://mubarikhammad:dtm82Jc9g4lwjdeZ@parking.74j5l.mongodb.net/parkingApp?retryWrites=true&w=majority&appName=parking"
).then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Define static parking slots
const allSlots = [
  ...Array.from({ length: 50 }, (_, i) => `A${i + 1}`),
  ...Array.from({ length: 50 }, (_, i) => `B${i + 1}`)
];

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

// Show available and booked slots
app.get("/slots", async (req, res) => {
  const { date, time } = req.query;

  try {
    const bookings = await Booking.find({ date, time });
    const bookedSlots = bookings.map(b => b.slot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      availableCount: availableSlots.length,
      bookedCount: bookedSlots.length,
      availableSlots,
      bookedSlots
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching slot data" });
  }
});

// Book a slot
    app.post("/book", async (req, res) => {
    const { date, time, userEmail } = req.body;
  
    try {
      // Get all booked slots for this date + time
      const bookings = await Booking.find({ date, time });
      const bookedSlots = bookings.map(b => b.slot);
  
      // All possible slots
      const allSlots = [
        ...Array.from({ length: 50 }, (_, i) => `A${i + 1}`),
        ...Array.from({ length: 50 }, (_, i) => `B${i + 1}`)
      ];
  
      // Find the next available slot
      const availableSlot = allSlots.find(slot => !bookedSlots.includes(slot));
  
      if (!availableSlot) {
        return res.json({ success: false, message: "No available slots." });
      }
  
      // Check if this user already has a booking for the same date & time
      const alreadyBooked = await Booking.findOne({ userEmail, date, time });
      if (alreadyBooked) {
        return res.json({
          success: false,
          message: `You already booked slot ${alreadyBooked.slot} for this time.`
        });
      }
  
      // Save the booking
      const newBooking = new Booking({
        userEmail,
        date,
        time,
        slot: availableSlot
      });
  
      await newBooking.save();
  
      res.json({ success: true, slot: availableSlot });
    } catch (error) {
      console.error("Booking failed:", error);
      res.status(500).json({ success: false, message: "Booking failed" });
    }
  });
  
  app.get("/my-bookings", async (req, res) => {
    const { email } = req.query;
  
    try {
      const bookings = await Booking.find({ userEmail: email }).sort({ date: 1, time: 1 });
      res.json({ success: true, bookings });
    } catch (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
  });


app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
