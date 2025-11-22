import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

/**
 * Create JWT token
 * @param {string} id
 */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment");
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

// ============================
// REGISTER
// ============================
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  // Normalize email
  const normalizedEmail = String(email).trim().toLowerCase();

  // Check if user already exists
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    return res.status(400).json({ message: "User already exists with that email" });
  }

  // Create new user (password hashing handled by model pre-save)
  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    role: role === "admin" ? "admin" : "user", // don't allow arbitrary admin elevation
  });

  const token = generateToken(user._id);

  // Return safe user object (no password)
  const userSafe = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  res.status(201).json({
    user: userSafe,
    token,
  });
});

// ============================
// LOGIN
// ============================
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = generateToken(user._id);

  const userSafe = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  res.json({
    user: userSafe,
    token,
  });
});
