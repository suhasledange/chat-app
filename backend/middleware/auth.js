import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes by verifying JWT token.
 */
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user without password
    const user = await User.findById(decoded.userID).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};


export const checkAuth = (req, res) => {
  if (req.user) {
    return res.status(200).json({
      success: true,
      message: "User is authenticated.",
      userData: req.user,
    });
  }

  return res.status(401).json({
    success: false,
    message: "Not authenticated.",
  });
};