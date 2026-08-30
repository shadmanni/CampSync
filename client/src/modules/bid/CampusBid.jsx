import React, { useState, useEffect } from "react";
import { Gavel, Clock, TrendingUp, Plus, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const CampusBid = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/bid/items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch marketplace items:", err);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidError("");

    if (!selectedItem) return;
    const amount = parseFloat(bidAmount);

    if (isNaN(amount) || amount <= selectedItem.currentBid) {
      setBidError(`Bid must be strictly higher than current highest bid (₹${selectedItem.currentBid}).`);
      return;
    }

    try {
      const res = await fetch(`/api/bid/items/${selectedItem.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          bidderName: user ? user.name : "Verified Student"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems(items.map(i => i.id === data.id ? data : i));
      setSelectedItem(data);
      setBidAmount("");
    } catch (err) {
      setBidError(err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Module Title */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>CampusBid Marketplace</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Campus-verified peer-to-peer student marketplace & live bidding auctions.
        </p>
      </div>

      {/* Grid of Items */}
      <div className="grid-cards">
        {items.map((item) => (
          <div key={item.id} className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span className="badge badge-emerald">Active Auction</span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--accent-amber)" }}>
                  <Clock size={14} />
                  <span>{item.expiresAt}</span>
                </div>
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "6px" }}>{item.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                {item.description}
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "14px", marginTop: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)", display: "block" }}>Highest Bid</span>
                  <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--accent-emerald)" }}>
                    ₹{item.currentBid}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)", display: "block" }}>Bidder</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>
                    {item.highestBidderName}
                  </span>
                </div>
              </div>

              <button className="btn btn-primary" onClick={() => { setSelectedItem(item); setBidError(""); setBidAmount(item.currentBid + 50); }} style={{ width: "100%" }}>
                <Gavel size={16} />
                <span>Place Bid</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bidding Drawer Modal */}
      {selectedItem && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "440px", padding: "24px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>Place Bid: {selectedItem.title}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              Current Highest: <strong style={{ color: "var(--accent-emerald)" }}>₹{selectedItem.currentBid}</strong> ({selectedItem.bidCount} bids placed)
            </p>

            {bidError && (
              <div style={{ padding: "8px 12px", borderRadius: "6px", background: "rgba(244, 63, 94, 0.15)", color: "#fda4af", fontSize: "0.8rem", marginBottom: "12px" }}>
                {bidError}
              </div>
            )}

            <form onSubmit={handlePlaceBid} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "6px" }}>Your Bid Amount (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min bid: ₹${selectedItem.currentBid + 1}`}
                  required
                />
              </div>

              {/* Quick Increment Buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                {[50, 100, 200].map(inc => (
                  <button
                    key={inc}
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "6px", fontSize: "0.8rem" }}
                    onClick={() => setBidAmount(selectedItem.currentBid + inc)}
                  >
                    +₹{inc}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedItem(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirm Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
