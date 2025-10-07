import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import mongoose from "mongoose";
import { auth } from "../middlewares/auth";

const router = Router();

// GET /wallet -> return wallet balance
router.get("/", auth, async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ wallet: user.wallet });
});

// POST /wallet/topup -> body: { amount: number }
router.post("/topup", auth, async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { amount } = req.body;
  const parsed = Number(amount);
  if (!parsed || parsed <= 0)
    return res.status(400).json({ message: "Invalid amount" });

  // Optional: restrict to allowed presets OR any amount
  const presets = [100, 200, 500];
  // if you want to enforce presets uncomment:
  // if (!presets.includes(parsed)) return res.status(400).json({ message: "Amount not allowed" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wallet += parsed;
    await user.save({ session });

    const tx = new Transaction({
      user: user._id,
      type: "topup",
      amount: parsed,
      details: { method: "wallet_topup" },
    });
    await tx.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: "Topup complete",
      wallet: user.wallet,
      transactionId: tx._id,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: (err as Error).message });
  }
});

// GET /wallet/transactions -> history (pagination)
router.get("/transactions", auth, async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const { page = 1, limit = 20 } = req.query as any;

  const txs = await Transaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .exec();

  return res.json({ transactions: txs });
});

export default router;
