import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  user: {
     type: String, 
     required: true, 
     trim: true 
  },
  email: { 
    type: String,
    required: true,
    unique: true,
    lowercase: true
   },
  phone: { 
     type: String,
     required: true,
      unique: true 
    },
  password: { 
     type: String,
     required: true, 
     select: false 
    },
  accountVerified: {
     type: Boolean,
     default: false
     },
  verificationCode: { 
    type: Number,
    select: false 
    },
  verificationCodeExpire: {
     type: Date,
     select: false
     },
  createdAt: { 
    type: Date, 
    default: Date.now
   }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// Compare password
userSchema.methods.comparePassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP
userSchema.methods.generateVerificationCode = async function() {
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
  this.verificationCode = otp;
  this.verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 min expiry
  return otp;
};

// Generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
};

export const User = mongoose.model("User", userSchema);
