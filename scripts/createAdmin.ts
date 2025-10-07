import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "../models/User";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";
const SALT_ROUNDS = 10;

const createAdmin = async () => {
  if (!MONGO_URI) throw new Error("MONGO_URI not set");

  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");

  const email = "admin@gameshop.com";
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("123456789", SALT_ROUNDS);

  const admin = new User({
    username: "Admin",
    email,
    password: hashedPassword,
    role: "admin",
    wallet: 0,
    purchasedGames: [],
  });

  await admin.save();
  console.log("✅ Admin created successfully");

  mongoose.disconnect();
};

createAdmin().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
