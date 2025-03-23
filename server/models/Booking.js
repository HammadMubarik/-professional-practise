const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  slot: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", BookingSchema);
