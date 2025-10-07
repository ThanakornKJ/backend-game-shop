import { Router, Request, Response } from "express";
import { Coupon } from "../models/Coupon";
import { auth, adminOnly } from "../middlewares/auth";

const router = Router();

// ===== List all coupons =====
router.get("/", async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find();
    return res.json(coupons);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

// ===== Create coupon (Admin only) =====
router.post("/", auth, adminOnly, async (req: Request, res: Response) => {
  try {
    const { code, discountAmount, discountPercent, maxUses } = req.body;
    const c = new Coupon({ code, discountAmount, discountPercent, maxUses });
    await c.save();
    return res.json(c);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
