import api from "./api";

export const tasksService = {
  async getTasks(status = "ALL", category = "All") {
    const params = {};
    if (status && status !== "ALL") params.status = status;
    if (category && category !== "All") params.category = category;
    return await api.get("/tasks", { params });
  },

  async createTask(taskData) {
    return await api.post("/tasks", taskData);
  },

  async claimTask(taskId) {
    return await api.post(`/tasks/${taskId}/claim`);
  },

  async completeTask(taskId) {
    return await api.post(`/tasks/${taskId}/complete`);
  }
};
