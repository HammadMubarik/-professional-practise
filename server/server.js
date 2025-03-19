const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "your_jwt_secret"; // Replace with a strong secret key

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Signup Route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "Error creating account" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ success: true, token });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
