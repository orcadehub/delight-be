const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const authMiddleware = require("../middlewares/AuthMiddleware");
const User = mongoose.model("User");

dotenv.config();

const OTPs = new Map(); // In-memory OTP store (for demo)

// Register User
router.post("/register", async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      phone,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login with email/password
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("login")
    const user = await User.findOne({ email }); // .lean() to get a plain JS object
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const { password: _, ...userData } = user; // Exclude password

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // optional: token expiration
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


// Request OTP
router.post("/request-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    OTPs.set(phone, otp); // Store OTP
    console.log(`OTP for ${phone}: ${otp}`); // Simulate sending SMS

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, fullName, email, otp } = req.body;

    const validOtp = OTPs.get(phone);
    if (otp !== validOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({
        fullName,
        phone,
        email,
        password: "", // No password for OTP
      });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    OTPs.delete(phone); // Remove OTP

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update User Profile (no image)
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const userId = req.user.userId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, email, phone },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
