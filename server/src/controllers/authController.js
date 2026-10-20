import "../config/env.js";
import jwt from "jsonwebtoken";
import { dbAdapter } from "../store/dbAdapter.js";

const ALLOWED_CAMPUS_DOMAINS = ["@learner.manipal.edu", "@manipal.edu"];

function jwtSecret() {
  return process.env.JWT_SECRET || "campussync_super_secret_jwt_key_2026";
}

function isCampusEmail(email) {
  return /^[^\s@]+@(learner\.manipal\.edu|manipal\.edu)$/.test(email)
    && ALLOWED_CAMPUS_DOMAINS.some(domain => email.endsWith(domain));
}

/** POST /api/auth/register — create or resume a campus account without OTP. */
export const register = async (req, res, next) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress || "unknown-ip";
    const ipCheck = dbAdapter.checkIpRateLimit(clientIp);
    if (!ipCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Too many account requests. Please retry in ${ipCheck.retryAfter}s.`
      });
    }

    const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
    const isAnonymous = req.body?.isAnonymous === true;
    const cleanName = String(req.body?.name || "").trim().replace(/\s+/g, " ");

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: "Manipal email address is required." });
    }
    if (!isCampusEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: "Please use an official @learner.manipal.edu or @manipal.edu email address."
      });
    }
    if (!isAnonymous && (cleanName.length < 2 || cleanName.length > 80)) {
      return res.status(400).json({
        success: false,
        error: "Enter a display name between 2 and 80 characters, or choose an anonymous profile."
      });
    }

    const user = await dbAdapter.registerUser({
      email: cleanEmail,
      name: cleanName,
      isAnonymous
    });
    const token = jwt.sign(
      { id: user.id, email: user.email, isVerified: user.isVerified, isAnonymous: user.isAnonymous },
      jwtSecret(),
      { expiresIn: "7d" }
    );

    return res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

/** GET /api/auth/me — retrieve the authenticated user profile. */
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
