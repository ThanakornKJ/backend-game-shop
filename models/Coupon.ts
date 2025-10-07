import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountAmount?: number; // absolute discount
  discountPercent?: number; // percent discount
  maxUses: number;
  usedCount: number;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true },
    discountAmount: { type: Number },
    discountPercent: { type: Number },
    maxUses: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>("Coupon", CouponSchema);
