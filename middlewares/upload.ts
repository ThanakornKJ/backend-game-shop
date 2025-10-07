import express from "express";
import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// สร้างโฟลเดอร์อัปโหลดอัตโนมัติถ้าไม่มี
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`✅ Created upload directory: ${UPLOAD_DIR}`);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    // อนุญาตเฉพาะไฟล์รูปภาพ
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Router สำหรับโหลดไฟล์
export const fileRouter = express.Router();

// Serve static files from uploads directory
fileRouter.use("/uploads", express.static(UPLOAD_DIR));

fileRouter.get("/:filename", (req, res) => {
  const filename = req.params.filename;
  const download = req.query.download === "true";
  const filepath = path.join(UPLOAD_DIR, filename);

  console.log(`📁 Serving file: ${filepath}`);

  if (!fs.existsSync(filepath)) {
    console.log(`❌ File not found: ${filename}`);
    return res.status(404).json({ message: "File not found" });
  }

  if (download) {
    res.download(filepath);
  } else {
    res.sendFile(filepath);
  }
});
