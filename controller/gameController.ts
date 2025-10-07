import { Router, Request, Response } from "express";
import { Game } from "../models/Game";
import { auth, adminOnly } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const router = Router();

// ===== List games =====
router.get("/", async (req: Request, res: Response) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query as any;
    const filter: any = {};
    if (q) filter.title = { $regex: q, $options: "i" };
    if (category) filter.category = category;

    const games = await Game.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    return res.json(games);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

// ===== Get single game =====
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: "Not found" });
    return res.json(game);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

// ===== Create game (Admin only) =====
router.post(
  "/",
  auth,
  adminOnly,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { title, price, category, description } = req.body;
      if (!req.file) return res.status(400).json({ message: "Image required" });

      const imageUrl = `/${(req.file as any).path}`;
      const game = new Game({
        title,
        price,
        category,
        description,
        imageUrl,
        releaseDate: new Date(),
      });

      await game.save();
      return res.json(game);
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
);

// ===== Update game (Admin only) =====
router.put(
  "/:id",
  auth,
  adminOnly,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const update: any = req.body;
      if (req.file) update.imageUrl = `/${(req.file as any).path}`;

      const game = await Game.findByIdAndUpdate(req.params.id, update, {
        new: true,
      });
      if (!game) return res.status(404).json({ message: "Not found" });

      return res.json(game);
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
);

// ===== Delete game (Admin only) =====
router.delete("/:id", auth, adminOnly, async (req: Request, res: Response) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
