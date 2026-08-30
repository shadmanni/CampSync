import api from "./api";

export const nearbyService = {
  async getDeals(category = "All", search = "") {
    const params = {};
    if (category && category !== "All" && category !== "All Perks") params.category = category;
    if (search) params.search = search;
    return await api.get("/nearby/deals", { params });
  }
};
