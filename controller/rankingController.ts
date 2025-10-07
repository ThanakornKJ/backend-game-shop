import { Router, Request, Response } from "express";
import { Transaction } from "../models/Transaction";
import { Game } from "../models/Game";
import mongoose from "mongoose";

const router = Router();

/**
 * GET /?date=YYYY-MM-DD        -> ranking for that date
 * GET /?from=YYYY-MM-DD&to=YYYY-MM-DD -> ranking for range
 * default: today
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { date, from, to, limit = 5 } = req.query as any;

    let start: Date, end: Date;
    if (date) {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    } else if (from && to) {
      start = new Date(from);
      start.setHours(0, 0, 0, 0);
      end = new Date(to);
      end.setHours(23, 59, 59, 999);
    } else {
      // default: today
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    // Aggregate transactions of type purchase in that period, sum counts per game
    const agg = await Transaction.aggregate([
      {
        $match: {
          type: "purchase",
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $unwind: "$details.games" }, // each purchase can contain multiple game ids
      {
        $group: {
          _id: "$details.games",
          sales: { $sum: 1 },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: "games",
          localField: "_id",
          foreignField: "_id",
          as: "game",
        },
      },
      { $unwind: "$game" },
      {
        $project: {
          _id: "$game._id",
          title: "$game.title",
          price: "$game.price",
          category: "$game.category",
          imageUrl: "$game.imageUrl",
          sales: 1,
        },
      },
    ]);

    return res.json({ rankings: agg });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
