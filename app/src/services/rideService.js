import api from "./api";

export const rideService = {
  async getRides(destination = "", search = "") {
    const params = {};
    if (destination && destination !== "All" && destination !== "All Rides") params.destination = destination;
    if (search) params.search = search;
    return await api.get("/ride/rides", { params });
  },

  async createRide(rideData) {
    return await api.post("/ride/rides", rideData);
  },

  async bookSeat(rideId, seats = 1, passengerName = "") {
    return await api.post(`/ride/rides/${rideId}/book`, { seats, passengerName });
  },

  async getEvents() {
    return await api.get("/ride/events");
  },

  async rsvpEvent(eventId) {
    return await api.post(`/ride/events/${eventId}/rsvp`);
  },

  async createEvent(eventData) {
    return await api.post("/ride/events", eventData);
  }
};
