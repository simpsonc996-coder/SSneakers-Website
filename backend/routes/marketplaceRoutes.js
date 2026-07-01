import express from "express";
import MarketplaceListing from "../models/MarketplaceListing.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route GET /api/marketplace
// @desc Get active marketplace listings
// @access Public
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    const query = { status: "active" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const listings = await MarketplaceListing.find(query)
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route GET /api/marketplace/mine
// @desc Get logged-in user's listings
// @access Private
router.get("/mine", protect, async (req, res) => {
  try {
    const listings = await MarketplaceListing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route POST /api/marketplace
// @desc Publish a sneaker listing
// @access Private
router.post("/", protect, async (req, res) => {
  try {
    const { title, brand, size, condition, price, description, imageUrl } = req.body;

    if (!title || !brand || !size || !condition || !price || !description) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const listing = new MarketplaceListing({
      title,
      brand,
      size,
      condition,
      price: Number(price),
      description,
      imageUrl: imageUrl || "",
      seller: req.user._id,
    });

    const createdListing = await listing.save();
    res.status(201).json(createdListing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
