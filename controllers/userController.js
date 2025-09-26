import { User } from "../models/userModel.js";
import ErrorHandler from "../middleware/error.js";
import sendEmail from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";

// ================= REGISTER =================
 const register = async (req, res, next) => {
  try {
    const { user, email, password, phone, verificationMethod } = req.body;

    if (!user || !email || !password || !phone || !verificationMethod) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    if (!/^\+91\d{10}$/.test(phone)) {
      return next(new ErrorHandler("Invalid Phone Number", 400));
    }

    // Remove old unverified users with same email/phone
    await User.deleteMany({
      $or: [{ email }, { phone }],
      accountVerified: false,
    });

    // Check if already registered and verified
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
      accountVerified: true,
    });

    if (existingUser) {
      return next(new ErrorHandler("Phone or Email already exists", 409));
    }

    // Create new user
    const newUser = await User.create({ user, email, phone, password });

    // Generate OTP
    const otp = newUser.generateVerificationCode();
    await newUser.save();

    // Send OTP (via email for now, you can extend to SMS later)
    if (verificationMethod === "email") {
      await sendEmail({
        email: newUser.email,
        subject: "Account Verification OTP",
        message: `Your OTP for account verification is: ${otp}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent for verification.",
    });
  } catch (error) {
    next(error);
  }
};
export default register;  

// ================= VERIFY OTP =================
export const verifyOTP = async (req, res, next) => {
  const { email, phone, otp } = req.body;

  try {
    const users = await User.find({
      $or: [{ email, accountVerified: false }, { phone, accountVerified: false }],
    })
      .select("+verificationCode +verificationCodeExpire")
      .sort({ createdAt: -1 });

    if (!users.length) {
      return next(new ErrorHandler("User not found", 404));
    }

    const user = users[0];

    if (String(user.verificationCode) !== String(otp)) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    if (Date.now() > user.verificationCodeExpire.getTime()) {
      return next(new ErrorHandler("OTP expired", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save();

    sendToken(user, 200, "Account verified successfully", res);
  } catch (error) {
    next(error);
  }
};

// ================= LOGIN =================
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await User.findOne({ email, accountVerified: true }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 401));

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new ErrorHandler("Invalid email or password", 401));

  sendToken(user, 200, "User logged in successfully", res);
};
