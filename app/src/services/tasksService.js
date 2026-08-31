import api from './api';

export const tasksService = {
  async getTasks(status, category) {
    const params = {};
    if (status && status !== 'All') params.status = status;
    if (category && category !== 'All') params.category = category;
    return await api.get('/tasks', { params });
  },

  async createTask({ title, description, category, reward, pickupLocation, dropLocation, deadline }) {
    return await api.post('/tasks', { title, description, category, reward, pickupLocation, dropLocation, deadline });
  },

  async acceptTask(id) {
    return await api.post(`/tasks/${id}/accept`);
  },

  async completeTask(id) {
    return await api.post(`/tasks/${id}/complete`);
  },
};
