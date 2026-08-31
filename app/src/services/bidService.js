import api from './api';

export const bidService = {
  async getItems(category, search) {
    const params = {};
    if (category && category !== 'All') params.category = category;
    if (search && search.trim()) params.search = search.trim();
    return await api.get('/bid/items', { params });
  },

  async placeBid(itemId, amount, bidderName) {
    return await api.post(`/bid/items/${itemId}/bid`, { amount, bidderName });
  },

  async createItem({ title, description, startingPrice, category }) {
    return await api.post('/bid/items', { title, description, startingPrice, category });
  },
};
