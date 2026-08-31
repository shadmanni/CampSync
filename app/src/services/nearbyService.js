import api from './api';

export const nearbyService = {
  async getDeals(category) {
    const params = {};
    if (category && category !== 'All') params.category = category;
    return await api.get('/nearby/deals', { params });
  },
};
