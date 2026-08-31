import { dbAdapter } from "../store/dbAdapter.js";

/**
 * GET /api/nearby/deals
 */
export const getDeals = async (req, res, next) => {
  try {
    const deals = await dbAdapter.getDeals();
    res.json(deals);
  } catch (err) {
    next(err);
  }
};
