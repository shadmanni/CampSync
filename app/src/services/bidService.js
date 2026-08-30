import api from "./api";

export const bidService = {
  // 1. Fetch marketplace items
  async getItems(category = "All", listingType = "ALL", search = "") {
    const params = {};
    if (category && category !== "All") params.category = category;
    if (listingType && listingType !== "ALL") params.listingType = listingType;
    if (search && search.trim()) params.search = search.trim();
    return await api.get("/bid/items", { params });
  },

  // 2. Fetch single item
  async getItemById(id) {
    return await api.get(`/bid/items/${id}`);
  },

  // 3. Place atomic bid on auction item
  async placeBid(id, amount) {
    return await api.post(`/bid/items/${id}/bid`, { amount: Number(amount) });
  },

  // 4. Create new listing (Auction or Fixed Price)
  async createListing(data) {
    return await api.post("/bid/items", data);
  }
};
