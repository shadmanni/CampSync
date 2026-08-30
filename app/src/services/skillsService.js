import api from "./api";

export const skillsService = {
  async getSkills(category = "All", type = "ALL", search = "") {
    const params = {};
    if (category && category !== "All") params.category = category;
    if (type && type !== "ALL") params.type = type;
    if (search) params.search = search;
    return await api.get("/skills", { params });
  },

  async getSkillById(id) {
    return await api.get(`/skills/${id}`);
  },

  async createSkill(skillData) {
    return await api.post("/skills", skillData);
  }
};
