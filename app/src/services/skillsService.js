import api from './api';

export const skillsService = {
  async getSkills(category, type, search) {
    const params = {};
    if (category && category !== 'All') params.category = category;
    if (type && type !== 'All') params.type = type;
    if (search && search.trim()) params.search = search.trim();
    return await api.get('/skills', { params });
  },

  async createSkill({ title, description, category, type, pricing, contact }) {
    return await api.post('/skills', { title, description, category, type, pricing, contact });
  },

  async deleteSkill(id) {
    return await api.delete(`/skills/${id}`);
  },
};
