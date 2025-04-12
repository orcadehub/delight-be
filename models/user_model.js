const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    certificateIds: [{ type: String }],
    isAdmin: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    addresses: [
      {
        fullName: String,
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        isDefault: Boolean,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
