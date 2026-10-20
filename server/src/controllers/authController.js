import "../config/env.js";
import jwt from "jsonwebtoken";
import { dbAdapter } from "../store/dbAdapter.js";
import { hashPassword, verifyPassword } from "../services/passwordService.js";

const ALLOWED_CAMPUS_DOMAINS = ["@learner.manipal.edu", "@manipal.edu"];

function jwtSecret() {
  return process.env.JWT_SECRET || "campussync_super_secret_jwt_key_2026";
}

function isCampusEmail(email) {
  return /^[^\s@]+@(learner\.manipal\.edu|manipal\.edu)$/.test(email)
    && ALLOWED_CAMPUS_DOMAINS.some(domain => email.endsWith(domain));
}

function cleanPassword(value) {
  return typeof value === "string" ? value : "";
}

function passwordError(password) {
  if (password.length < 8) return "Password must contain at least 8 characters.";
  if (password.length > 128) return "Password must be no longer than 128 characters.";
  return null;
}

function rateLimitRequest(req, res) {
  const clientIp = req.ip || req.connection.remoteAddress || "unknown-ip";
  const check = dbAdapter.checkIpRateLimit(clientIp);
  if (check.allowed) return false;
  res.status(429).json({
    success: false,
    error: `Too many authentication requests. Please retry in ${check.retryAfter}s.`
  });
  return true;
}

function createSession(user) {
  return jwt.sign(
    { id: user.id, email: user.email, isVerified: user.isVerified, isAnonymous: user.isAnonymous },
    jwtSecret(),
    { expiresIn: "7d" }
  );
}

/** POST /api/auth/register — create one password-protected campus account. */
export const register = async (req, res, next) => {
  try {
    if (rateLimitRequest(req, res)) return;

    const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
    const isAnonymous = req.body?.isAnonymous === true;
    const cleanName = String(req.body?.name || "").trim().replace(/\s+/g, " ");
    const password = cleanPassword(req.body?.password);

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
    const invalidPassword = passwordError(password);
    if (invalidPassword) {
      return res.status(400).json({ success: false, error: invalidPassword });
    }

    const passwordHash = await hashPassword(password);
    const result = await dbAdapter.createPasswordUser({
      email: cleanEmail,
      name: cleanName,
      isAnonymous,
      passwordHash
    });

    if (!result.created) {
      return res.status(409).json({
        success: false,
        code: "EMAIL_ALREADY_REGISTERED",
        error: "An account already exists for this email. Sign in with its password."
      });
    }

    return res.status(201).json({
      success: true,
      token: createSession(result.user),
      user: result.user,
      claimedLegacyAccount: result.claimedLegacy
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/login — sign in to an existing password-protected account. */
export const login = async (req, res, next) => {
  try {
    if (rateLimitRequest(req, res)) return;

    const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
    const password = cleanPassword(req.body?.password);
    if (!isCampusEmail(cleanEmail) || !password) {
      return res.status(400).json({ success: false, error: "Manipal email and password are required." });
    }

    const credentials = await dbAdapter.findUserCredentialsByEmail(cleanEmail);
    const valid = credentials?.passwordHash
      ? await verifyPassword(password, credentials.passwordHash)
      : false;

    if (!valid) {
      return res.status(401).json({
        success: false,
        code: credentials && !credentials.passwordHash ? "LEGACY_ACCOUNT" : "INVALID_CREDENTIALS",
        error: credentials && !credentials.passwordHash
          ? "This older account has no password yet. Use Create account once to secure it."
          : "Incorrect email or password."
      });
    }

    return res.json({
      success: true,
      token: createSession(credentials.user),
      user: credentials.user
    });
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
