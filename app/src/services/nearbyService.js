import api from "./api";

export const nearbyService = {
  // 1. Fetch student deals & discounts
  async getDeals(category = "All") {
    const params = {};
    if (category && category !== "All") params.category = category;
    return await api.get("/nearby/deals", { params });
  }
};
