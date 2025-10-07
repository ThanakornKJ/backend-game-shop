import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: "topup" | "purchase";
  amount: number;
  details?: any;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["topup", "purchase"], required: true },
    amount: { type: Number, required: true },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
