import React, { useState, useEffect } from "react";
import { Car, Users, Calendar, MapPin, Plus, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const CampusRide = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [events, setEvents] = useState([]);
  const [showNewRideModal, setShowNewRideModal] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [totalSeats, setTotalSeats] = useState(4);
  const [pricePerSeat, setPricePerSeat] = useState(50);

  useEffect(() => {
    fetchRides();
    fetchEvents();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await fetch("/api/ride/rides");
      const data = await res.json();
      setRides(data);
    } catch (err) {
      console.error("Failed to fetch rides:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/ride/events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  const handleJoinRide = async (rideId) => {
    try {
      const res = await fetch(`/api/ride/rides/${rideId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengerName: user ? user.name : "Verified Passenger" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRides(rides.map(r => r.id === data.id ? data : r));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateRide = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/ride/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, departureTime, totalSeats, pricePerSeat })
      });
      const data = await res.json();
      setRides([data, ...rides]);
      setShowNewRideModal(false);
      setOrigin("");
      setDestination("");
    } catch (err) {
      console.error("Failed to create ride:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* SECTION 1: CARPOOLS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>CampusRide (Carpool Sharing)</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Share rides with verified campus students & track seat counts in real-time.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNewRideModal(true)}>
            <Plus size={16} />
            <span>Post a Ride</span>
          </button>
        </div>

        <div className="grid-cards">
          {rides.map((ride) => (
            <div key={ride.id} className="glass-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span className="badge badge-cyan">Driver: {ride.driverName}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--accent-emerald)" }}>₹{ride.pricePerSeat}/seat</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                  <MapPin size={16} color="var(--primary-500)" />
                  <span><strong>From:</strong> {ride.origin}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                  <MapPin size={16} color="var(--accent-cyan)" />
                  <span><strong>To:</strong> {ride.destination}</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  🕒 Leaving: {ride.departureTime}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Users size={16} color="var(--accent-amber)" />
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", color: ride.availableSeats > 0 ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                    {ride.availableSeats} / {ride.totalSeats} seats left
                  </span>
                </div>

                <button
                  className="btn btn-accent"
                  style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                  disabled={ride.availableSeats <= 0}
                  onClick={() => handleJoinRide(ride.id)}
                >
                  {ride.availableSeats > 0 ? "Join Ride" : "Full"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: CAMPUS EVENTS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>Campus Events & Gatherings</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {events.map((evt) => (
            <div key={evt.id} className="glass-card" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <span className="badge badge-amber" style={{ marginBottom: "6px" }}>{evt.category}</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>{evt.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>{evt.description}</p>
                <div style={{ fontSize: "0.8rem", color: "var(--text-subtle)", marginTop: "6px" }}>
                  📍 {evt.venue} | 📅 {evt.dateTime}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{evt.attendeesCount} Students Attending</span>
                <button className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>RSVP Going</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Ride Modal */}
      {showNewRideModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
        }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "450px", padding: "24px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "14px" }}>Offer Carpool / Ride</h3>
            <form onSubmit={handleCreateRide} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>Origin</label>
                <input className="input-field" placeholder="e.g. Main Gate" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>Destination</label>
                <input className="input-field" placeholder="e.g. Metro Station" value={destination} onChange={(e) => setDestination(e.target.value)} required />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>Departure Time</label>
                <input className="input-field" placeholder="e.g. Today at 6:00 PM" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>Seats Available</label>
                  <input type="number" className="input-field" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>Price / Seat (₹)</label>
                  <input type="number" className="input-field" value={pricePerSeat} onChange={(e) => setPricePerSeat(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewRideModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Ride</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
