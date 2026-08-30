import { dbAdapter } from "../store/dbAdapter.js";

/**
 * GET /api/bid/items
 */
export const getItems = async (req, res, next) => {
  try {
    const items = await dbAdapter.getItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/bid/items
 */
export const createItem = async (req, res, next) => {
  try {
    const { title, description, startingPrice, category, expiresAt } = req.body;

    if (!title || !title.trim() || !startingPrice) {
      return res.status(400).json({ success: false, error: "Title and starting price are required." });
    }

    const price = parseFloat(startingPrice);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, error: "Valid starting price is required." });
    }

    const sellerId = req.user ? req.user.id : "u-guest";
    const sellerName = req.user ? req.user.name : "Verified Seller";

    const newItem = await dbAdapter.createItem({
      sellerId,
      sellerName,
      title: title.trim(),
      description: description ? description.trim() : "",
      startingPrice: price,
      category: category || "General",
      expiresAt: expiresAt || "In 24 hours"
    });

    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/bid/items/:id/bid
 * Concurrency-safe atomic bid placement
 */
export const placeBid = async (req, res, next) => {
  try {
    const { amount, bidderName } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: "Please enter a valid bid amount." });
    }

    const bidderId = req.user ? req.user.id : `u-guest-${Date.now()}`;
    const resolvedName = req.user ? req.user.name : (bidderName || "Verified Student");

    // Execute atomic guarded update
    const result = await dbAdapter.placeAtomicBid(req.params.id, bidderId, resolvedName, numericAmount);

    if (!result.success) {
      return res.status(409).json({ success: false, error: result.error });
    }

    // Broadcast live update to all Web and Mobile clients
    if (req.io) {
      req.io.emit("bid:new_highest", {
        itemId: result.item.id,
        currentBid: result.item.currentBid,
        highestBidderName: result.item.highestBidderName,
        bidCount: result.item.bidCount
      });
    }

    res.json(result.item);
  } catch (err) {
    next(err);
  }
};
