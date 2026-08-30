import api from "./api";

export const skillsService = {
  // 1. Fetch skill listings with filters
  async getSkills(category = "All", type = "ALL", search = "") {
    const params = {};
    if (category && category !== "All") params.category = category;
    if (type && type !== "ALL") params.type = type;
    if (search && search.trim()) params.search = search.trim();
    return await api.get("/skills", { params });
  },

  // 2. Fetch single skill by ID
  async getSkillById(id) {
    return await api.get(`/skills/${id}`);
  },

  // 3. Create new skill offer or request
  async createSkill(data) {
    return await api.post("/skills", data);
  }
};
