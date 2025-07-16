import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

/**
 * Handles user signup.
 * Validates input, checks for existing account,
 * hashes password, saves user, and returns a token.
 */
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    // Validate required fields
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    // Generate JWT token
    const token = generateToken(newUser._id);

    // Respond with user data (excluding password) and token
    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      userData: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        bio: newUser.bio,
        createdAt: newUser.createdAt,
      },
      token,
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  }
};
