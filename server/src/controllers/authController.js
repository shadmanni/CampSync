import "../config/env.js";
import { randomInt } from "crypto";
import jwt from "jsonwebtoken";
import { dbAdapter } from "../store/dbAdapter.js";
import { sendOtpEmail } from "../services/emailService.js";

function jwtSecret() {
  return process.env.JWT_SECRET || "campussync_super_secret_jwt_key_2026";
}

// College email domains allowed
const ALLOWED_CAMPUS_DOMAINS = ["@learner.manipal.edu", "@manipal.edu"];

/**
 * POST /api/auth/request-otp
 * Rate-limited per IP and per Email with cooldown
 */
export const requestOtp = async (req, res, next) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress || "unknown-ip";

    // 1. IP Rate Limiting check
    const ipCheck = dbAdapter.checkIpRateLimit(clientIp);
    if (!ipCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Too many requests from your network. Please retry in ${ipCheck.retryAfter}s.`
      });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "College email address is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isCollegeDomain = ALLOWED_CAMPUS_DOMAINS.some(domain => cleanEmail.endsWith(domain)) || cleanEmail.includes("manipal.edu");

    if (!isCollegeDomain) {
      return res.status(400).json({
        success: false,
        error: "Access restricted. Please use your official Manipal email address (e.g. yourname@learner.manipal.edu)."
      });
    }

    const otpCode = process.env.NODE_ENV === "test"
      ? "123456"
      : randomInt(100000, 1000000).toString();

    // 2. Email Rate Limiting & Cooldown check
    const otpResult = await dbAdapter.recordOtpRequest(cleanEmail, otpCode);
    if (!otpResult.success) {
      return res.status(429).json({ success: false, error: otpResult.error });
    }

    // 3. Dispatch real email strictly to the student's respective inbox
    const emailResult = await sendOtpEmail({ toEmail: cleanEmail, otpCode });

    if (!emailResult.success) {
      await dbAdapter.deleteOtpRequest(cleanEmail, otpCode);
      console.warn(`⚠️ Email delivery failed to ${cleanEmail}: ${emailResult.error}`);
      return res.status(502).json({
        success: false,
        error: "We could not send the verification email. Please try again shortly."
      });
    }

    return res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}.`,
      simulated: emailResult.simulated || false
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/verify-otp
 * Verifies OTP with max 5 attempts lockout
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: "Email and OTP code are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const verification = await dbAdapter.verifyOtpCode(cleanEmail, otp.trim());

    if (!verification.success) {
      return res.status(400).json({ success: false, error: verification.error });
    }

    // Retrieve or create user record
    const user = await dbAdapter.getOrCreateUser(cleanEmail);

    // Sign JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isVerified: user.isVerified },
      jwtSecret(),
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated." });
    }
    return res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};
