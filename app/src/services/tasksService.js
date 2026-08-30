import api from "./api";

export const tasksService = {
  // 1. Fetch campus tasks / gigs with filters
  async getTasks(status = "ALL", category = "All") {
    const params = {};
    if (status && status !== "ALL") params.status = status;
    if (category && category !== "All") params.category = category;
    return await api.get("/tasks", { params });
  },

  // 2. Create new task gig
  async createTask(data) {
    return await api.post("/tasks", data);
  },

  // 3. Claim / Accept gig atomically
  async claimTask(id) {
    return await api.post(`/tasks/${id}/accept`);
  },

  // 4. Complete task
  async completeTask(id) {
    return await api.post(`/tasks/${id}/complete`);
  }
};
