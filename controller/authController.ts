import { Router, Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { upload } from "../middlewares/upload";
import { verifyToken } from "../middlewares/auth";
import path from "path";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const SALT_ROUNDS = 10;

const router = Router();

// ===== Register =====
router.post(
  "/register",
  upload.single("avatar"),
  async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;

      console.log("📝 Register request:", {
        username,
        email,
        hasAvatar: !!req.file,
      });

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Missing fields" });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "Email already used" });
      }

      const hash = await bcrypt.hash(password, SALT_ROUNDS);

      // ✅ จัดการไฟล์ avatar
      let avatarUrl = null;
      if (req.file) {
        // บันทึกแค่ชื่อไฟล์ ไม่ต้องมี path เต็ม
        avatarUrl = req.file.filename;
        console.log("✅ Avatar uploaded:", avatarUrl);
      }

      const user = new User({
        username,
        email,
        password: hash,
        avatarUrl, // บันทึกแค่ชื่อไฟล์
        role: "user",
        wallet: 0,
        purchasedGames: [],
      });

      await user.save();

      console.log("✅ User registered successfully:", user._id);

      return res.json({
        message: "Registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatarUrl: avatarUrl ? `/uploads/${avatarUrl}` : null,
        },
      });
    } catch (err) {
      console.error("❌ Registration error:", err);
      return res.status(500).json({ error: (err as Error).message });
    }
  }
);

// ===== Login =====
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log("❌ Invalid password for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ Login successful:", user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl ? `/uploads/${user.avatarUrl}` : null,
        wallet: user.wallet,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// ===== Profile Get =====
router.get("/profile/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("🔄 Loading profile for user ID:", id);

    const user = await User.findById(id).populate("purchasedGames");
    if (!user) {
      console.log("❌ User not found:", id);
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ สร้าง avatar URL ที่ถูกต้อง
    let avatarUrl = null;
    if (user.avatarUrl) {
      // ถ้า avatarUrl เป็นแค่ชื่อไฟล์ ให้สร้าง path เต็ม
      if (user.avatarUrl.startsWith("http") || user.avatarUrl.startsWith("/")) {
        avatarUrl = user.avatarUrl;
      } else {
        avatarUrl = `/uploads/${user.avatarUrl}`;
      }
    }

    const responseData = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: avatarUrl,
      wallet: user.wallet,
      purchasedGames: user.purchasedGames,
      role: user.role,
      memberSince: user.createdAt,
    };

    console.log("✅ Profile data sent:", {
      id: responseData.id,
      username: responseData.username,
      hasAvatar: !!responseData.avatarUrl,
      avatarUrl: responseData.avatarUrl,
    });

    res.json(responseData);
  } catch (err) {
    console.error("❌ Profile load error:", err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
