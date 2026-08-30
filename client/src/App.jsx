import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./modules/auth/AuthModal";
import { CampusConnect } from "./modules/connect/CampusConnect";
import { CampusBid } from "./modules/bid/CampusBid";
import { CampusRide } from "./modules/ride/CampusRide";
import { CampusNearby } from "./modules/nearby/CampusNearby";
import "./styles/design-system.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("connect");

  return (
    <AuthProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="container" style={{ flex: 1 }}>
          {activeTab === "connect" && <CampusConnect />}
          {activeTab === "bid" && <CampusBid />}
          {activeTab === "ride" && <CampusRide />}
          {activeTab === "nearby" && <CampusNearby />}
        </main>

        <footer style={{
          borderTop: "1px solid var(--border-glass)",
          padding: "20px",
          textAlign: "center",
          color: "var(--text-subtle)",
          fontSize: "0.8rem",
          marginTop: "40px"
        }}>
          CampusSync — Unified Campus Platform | CPI Team Project (8 Members)
        </footer>

        <AuthModal />
      </div>
    </AuthProvider>
  );
}
