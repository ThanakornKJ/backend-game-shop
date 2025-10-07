import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  title: string;
  price: number;
  category: string;
  imageUrl: string;
  description?: string;
  releaseDate: Date;
  salesCount: number; // used for ranking
}

const GameSchema = new Schema<IGame>(
  {
    title: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    description: { type: String },
    releaseDate: { type: Date, default: () => new Date() },
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Game = mongoose.model<IGame>("Game", GameSchema);
