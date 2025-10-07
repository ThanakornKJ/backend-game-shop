import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  avatarUrl?: string;
  wallet: number;
  purchasedGames: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatarUrl: { type: String },
    wallet: { type: Number, default: 0 },
    purchasedGames: [{ type: Schema.Types.ObjectId, ref: "Game" }],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
