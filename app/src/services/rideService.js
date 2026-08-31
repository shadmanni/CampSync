import api from './api';

export const rideService = {
  async getRides() {
    return await api.get('/ride/rides');
  },

  async bookSeat(rideId, passengerName, seatsCount = 1) {
    return await api.post(`/ride/rides/${rideId}/join`, { passengerName, seatsCount });
  },

  async createRide({ origin, destination, departureTime, totalSeats, pricePerSeat }) {
    return await api.post('/ride/rides', { origin, destination, departureTime, totalSeats, pricePerSeat });
  },

  async getEvents() {
    return await api.get('/ride/events');
  },

  async rsvpEvent(eventId) {
    return await api.post(`/ride/events/${eventId}/rsvp`);
  },
};
