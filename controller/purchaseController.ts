import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { Game } from "../models/Game";
import { Transaction } from "../models/Transaction";
import { Coupon } from "../models/Coupon";
import mongoose from "mongoose";
import { auth } from "../middlewares/auth";

const router = Router();

// type-safe request
interface AuthRequest extends Request {
  user?: {
    _id: string | mongoose.Types.ObjectId;
    role: "user" | "admin";
  };
}

// POST /checkout
router.post("/checkout", auth, async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { gameIds, couponCode } = req.body;

    if (!Array.isArray(gameIds) || gameIds.length === 0)
      return res.status(400).json({ message: "No games" });

    const user = await User.findById(userId).session(session);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent buying already owned games
    const alreadyOwned = user.purchasedGames.map(String);
    for (const id of gameIds) {
      if (alreadyOwned.includes(id))
        return res.status(400).json({ message: "Contains already owned game" });
    }

    // Find games
    const games = await Game.find({
      _id: {
        $in: gameIds.map((id: string) => new mongoose.Types.ObjectId(id)),
      },
    }).session(session);

    if (games.length !== gameIds.length)
      return res.status(400).json({ message: "Some games not found" });

    // Calculate total
    let total = games.reduce((s, g) => s + g.price, 0);

    // coupon
    let coupon: any = null;
    if (couponCode) {
      const normalized = String(couponCode).trim();
      coupon = await Coupon.findOne({ code: normalized }).session(session);
      if (!coupon) return res.status(400).json({ message: "Invalid coupon" });

      // check global uses
      if (coupon.usedCount >= coupon.maxUses)
        return res.status(400).json({ message: "Coupon exhausted" });

      // check per-user usage: user already used this coupon?
      const usedByUser = await Transaction.findOne({
        user: user._id,
        "details.coupon": normalized,
      }).session(session);

      if (usedByUser)
        return res
          .status(400)
          .json({ message: "Coupon already used by this account" });

      // apply discounts
      if (coupon.discountAmount) total -= coupon.discountAmount;
      if (coupon.discountPercent)
        total -= (total * coupon.discountPercent) / 100;
      if (total < 0) total = 0;
    }

    // Wallet check
    if (user.wallet < total)
      return res.status(400).json({ message: "Insufficient wallet" });

    // Update wallet & purchasedGames
    user.wallet -= total;
    user.purchasedGames = [
      ...new Set([
        ...user.purchasedGames.map(String),
        ...games.map((g) => String(g._id)),
      ]),
    ].map((id) => new mongoose.Types.ObjectId(id));
    await user.save({ session });

    // Increase sales count
    await Game.updateMany(
      { _id: { $in: games.map((g) => g._id) } },
      { $inc: { salesCount: 1 } },
      { session }
    );

    // coupon increment
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save({ session });
    }

    // Create transaction (record purchase)
    const tx = new Transaction({
      user: user._id,
      type: "purchase",
      amount: total,
      details: { games: gameIds, coupon: couponCode },
    });
    await tx.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: "Purchase complete",
      total,
      wallet: user.wallet,
      transactionId: tx._id,
      games: games.map((g) => ({ _id: g._id, title: g.title, price: g.price })),
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
