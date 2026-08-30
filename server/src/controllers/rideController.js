import { dbAdapter } from "../store/dbAdapter.js";

/**
 * GET /api/ride/rides
 */
export const getRides = async (req, res, next) => {
  try {
    const rides = await dbAdapter.getRides();
    res.json(rides);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ride/rides
 */
export const createRide = async (req, res, next) => {
  try {
    const { origin, destination, departureTime, totalSeats, pricePerSeat } = req.body;

    if (!origin || !destination || !departureTime) {
      return res.status(400).json({ success: false, error: "Origin, destination, and departure time are required." });
    }

    const seats = parseInt(totalSeats, 10) || 4;
    const price = parseFloat(pricePerSeat) || 50;

    const driverId = req.user ? req.user.id : "u-guest";
    const driverName = req.user ? req.user.name : "Verified Student Driver";

    const newRide = await dbAdapter.createRide({
      driverId,
      driverName,
      origin: origin.trim(),
      destination: destination.trim(),
      departureTime: departureTime.trim(),
      totalSeats: seats,
      pricePerSeat: price
    });

    res.status(201).json(newRide);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ride/rides/:id/join
 * Overbooking-safe atomic seat reservation
 */
export const joinRide = async (req, res, next) => {
  try {
    const seatsCount = parseInt(req.body.seatsCount, 10) || 1;
    const passengerId = req.user ? req.user.id : `u-guest-${Date.now()}`;
    const passengerName = req.user ? req.user.name : (req.body.passengerName || "Verified Passenger");

    // Execute atomic guarded seat decrement
    const result = await dbAdapter.joinAtomicRide(req.params.id, passengerId, passengerName, seatsCount);

    if (!result.success) {
      return res.status(409).json({ success: false, error: result.error });
    }

    // Broadcast live seat update to all Web and Mobile clients
    if (req.io) {
      req.io.emit("ride:seat_updated", {
        rideId: result.ride.id,
        availableSeats: result.ride.availableSeats
      });
    }

    res.json(result.ride);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/ride/events
 */
export const getEvents = async (req, res, next) => {
  try {
    const events = await dbAdapter.getEvents();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ride/events/:id/rsvp
 */
export const rsvpEvent = async (req, res, next) => {
  try {
    const event = await dbAdapter.rsvpEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found." });
    }
    res.json({ success: true, attendeesCount: event.attendees_count || event.attendeesCount });
  } catch (err) {
    next(err);
  }
};
