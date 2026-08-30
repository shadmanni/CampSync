import api from "./api";

export const rideService = {
  // 1. Fetch carpool rides
  async getRides(origin = "", destination = "") {
    const params = {};
    if (origin) params.origin = origin;
    if (destination) params.destination = destination;
    return await api.get("/ride/rides", { params });
  },

  // 2. Book seat atomically
  async bookRide(id, seatsCount = 1) {
    return await api.post(`/ride/rides/${id}/book`, { seatsCount: Number(seatsCount) });
  },

  // 3. Post a new ride
  async createRide(data) {
    return await api.post("/ride/rides", data);
  },

  // 4. Fetch campus events
  async getEvents() {
    return await api.get("/ride/events");
  },

  // 5. RSVP for an event
  async rsvpEvent(id) {
    return await api.post(`/ride/events/${id}/rsvp`);
  }
};
