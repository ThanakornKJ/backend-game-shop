import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";

dotenv.config();
import { connectDB } from "./db/dbconnect";
import authRoutes from "./controller/authController";
import gameRoutes from "./controller/gameController";
import walletRoutes from "./controller/walletController";
import purchaseRoutes from "./controller/purchaseController";
import couponRoutes from "./controller/couponController";
import rankingRoutes from "./controller/rankingController";
import { User } from "./models/User";

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

// ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ✅ อนุญาต frontend Angular
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ serve static upload path - แก้ไขให้ถูกต้อง
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), UPLOAD_DIR), {
    setHeaders: (res, path) => {
      // ตั้งค่า CORS headers สำหรับไฟล์ static
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
    },
  })
);

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/ranking", rankingRoutes);

app.get("/", (req, res) => res.send("Hello GameShop"));

// ✅ seed admin user
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_SEED_EMAIL;
    const adminPass = process.env.ADMIN_SEED_PASSWORD;
    if (!adminEmail || !adminPass) return;

    const exists = await User.findOne({ email: adminEmail });
    if (!exists) {
      const hash = await bcrypt.hash(adminPass, 10);
      const admin = new User({
        username: "admin",
        email: adminEmail,
        password: hash,
        role: "admin",
      });
      await admin.save();
      console.log("✅ Admin seeded");
    }
  } catch (err) {
    console.error("Seed admin error", err);
  }
};

// ✅ connect & start server
connectDB()
  .then(async () => {
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📁 Serving static files from: ${path.join(process.cwd(), UPLOAD_DIR)}`
      );
    });
  })
  .catch((err) => console.error(err));

export { app };
