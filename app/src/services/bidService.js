import api from "./api";

export const bidService = {
  async getItems(category = "All", type = "ALL", search = "") {
    const params = {};
    if (category && category !== "All" && category !== "All Items") params.category = category;
    if (type && type !== "ALL") params.type = type;
    if (search) params.search = search;
    return await api.get("/bid/items", { params });
  },

  async getItemById(id) {
    return await api.get(`/bid/items/${id}`);
  },

  async createItem(itemData) {
    return await api.post("/bid/items", itemData);
  },

  async placeBid(itemId, amount, bidderName) {
    return await api.post(`/bid/items/${itemId}/bid`, { amount, bidderName });
  },

  async getMyBids() {
    return await api.get("/bid/my-bids");
  }
};
