import React from "react";
import { MessageSquare, Gavel, Car, Compass, ShieldCheck, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, setIsAuthModalOpen } = useAuth();

  const navItems = [
    { id: "connect", label: "CampusConnect", icon: MessageSquare, badge: "Feed" },
    { id: "bid", label: "CampusBid", icon: Gavel, badge: "Auction" },
    { id: "ride", label: "CampusRide & Events", icon: Car, badge: "Live Seats" },
    { id: "nearby", label: "CampusNearby", icon: Compass, badge: "Deals" }
  ];

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(11, 15, 25, 0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border-glass)",
      padding: "12px 24px"
    }}>
      <div style={{
        maxWidth: "1240px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap"
      }}>
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setActiveTab("connect")}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "1.2rem",
            color: "#fff",
            boxShadow: "0 0 16px rgba(99, 102, 241, 0.4)"
          }}>
            CS
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "800", background: "linear-gradient(90deg, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              CampusSync
            </h1>
            <span style={{ fontSize: "0.7rem", color: "var(--accent-cyan)", fontWeight: "600", letterSpacing: "0.05em" }}>
              UNIFIED CAMPUS PLATFORM
            </span>
          </div>
        </div>

        {/* Core Navigation Tabs */}
        <nav style={{ display: "flex", gap: "6px", background: "rgba(30, 41, 59, 0.5)", padding: "4px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: isActive ? "linear-gradient(135deg, var(--primary-500), var(--primary-600))" : "transparent",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  fontWeight: isActive ? "600" : "500",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Auth Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)"
              }}>
                <ShieldCheck size={14} color="#10b981" />
                <span style={{ fontSize: "0.75rem", color: "#6ee7b7", fontWeight: "600" }}>Verified Student</span>
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>{user.name}</span>
              <button className="btn btn-secondary" onClick={logout} style={{ padding: "6px 10px", fontSize: "0.8rem" }}>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsAuthModalOpen(true)}>
              <User size={16} />
              <span>Campus Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
