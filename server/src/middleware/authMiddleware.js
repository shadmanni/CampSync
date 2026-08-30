import jwt from "jsonwebtoken";
import { dbAdapter } from "../store/dbAdapter.js";

const JWT_SECRET = process.env.JWT_SECRET || "campussync_super_secret_jwt_key_2026";

/**
 * Authentication Middleware:
 * Validates the Bearer JWT token from the Authorization header and attaches the user to req.user.
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please provide a valid Bearer token."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbAdapter.findUserById(decoded.id);

    if (!user) {
      // Allow decoded payload fallback if user ID exists
      req.user = { id: decoded.id, email: decoded.email, isVerified: decoded.isVerified };
    } else {
      req.user = user;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired authentication token. Please sign in again."
    });
  }
};

/**
 * Optional Auth Middleware:
 * Attaches user to req.user if a valid token is provided, but does not block requests without a token.
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await dbAdapter.findUserById(decoded.id) || decoded;
    } catch {
      // Silently continue for optional auth
    }
  }
  next();
};
