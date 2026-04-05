import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const router = Router();

function toPublicUser(doc) {
  return {
    id: doc._id,
    fullName: doc.name,
    email: doc.email,
  };
}

router.post("/register", async (req, res) => {
  try {
    const raw = req.body && typeof req.body === "object" ? req.body : {};
    const fullName =
      typeof raw.fullName === "string" ? raw.fullName.trim() : "";
    const email =
      typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
    const password =
      typeof raw.password === "string" ? raw.password : "";

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "fullName, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const raw = req.body && typeof req.body === "object" ? req.body : {};
    const email =
      typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
    const password =
      typeof raw.password === "string" ? raw.password : "";

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});

export default router;
