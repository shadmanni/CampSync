import React, { useState, useEffect } from "react";
import { Compass, Tag, CheckCircle2, Copy, Check } from "lucide-react";

export const CampusNearby = () => {
  const [deals, setDeals] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await fetch("/api/nearby/deals");
      const data = await res.json();
      setDeals(data);
    } catch (err) {
      console.error("Failed to fetch deals:", err);
    }
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>CampusNearby Local Discovery</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Exclusive student discounts, partner offers & local campus hangouts.
        </p>
      </div>

      <div className="grid-cards">
        {deals.map((deal) => (
          <div key={deal.id} className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span className="badge badge-emerald" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 size={12} />
                  <span>{deal.isPartner ? "Official Campus Partner" : "Community Deal"}</span>
                </span>
                <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--accent-cyan)" }}>
                  {deal.discountPercent}% OFF
                </span>
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px" }}>{deal.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: "500", marginBottom: "6px" }}>{deal.businessName}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>📍 {deal.distance}</p>
            </div>

            <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "14px", marginTop: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", display: "block" }}>Promo Code</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: "700", letterSpacing: "0.05em", color: "var(--accent-amber)" }}>
                    {deal.code}
                  </span>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => handleCopyCode(deal.id, deal.code)}
                  style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                >
                  {copiedId === deal.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedId === deal.id ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
