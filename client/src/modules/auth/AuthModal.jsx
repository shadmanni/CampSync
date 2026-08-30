import React, { useState } from "react";
import { Mail, Key, ShieldCheck, X, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoNotice, setDemoNotice] = useState("");

  if (!isAuthModalOpen) return null;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.endsWith("@college.edu") && !email.endsWith("@campus.ac.in") && !email.endsWith("@university.edu")) {
      setError("Please enter a valid college email address (e.g. name@college.edu).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep(2);
      setDemoNotice(data.demoNotice || "Enter code 123456 to verify.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      login(data.user, data.token);
      setIsAuthModalOpen(false);
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "420px", padding: "28px", position: "relative" }}>
        <button
          onClick={() => setIsAuthModalOpen(false)}
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px"
          }}>
            <ShieldCheck size={26} color="#6366f1" />
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>Campus Verification</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Sign in with your official college email to access CampusSync modules.
          </p>
        </div>

        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            borderRadius: "8px",
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fda4af",
            fontSize: "0.8rem",
            marginBottom: "16px"
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "6px" }}>College Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-subtle)" }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: "38px" }}
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", marginTop: "8px" }}>
              {loading ? "Sending OTP..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {demoNotice && (
              <div style={{ padding: "8px", borderRadius: "6px", background: "rgba(6, 182, 212, 0.15)", color: "#67e8f9", fontSize: "0.8rem", textAlign: "center" }}>
                {demoNotice}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "6px" }}>Enter 6-Digit OTP</label>
              <div style={{ position: "relative" }}>
                <Key size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-subtle)" }} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: "38px", letterSpacing: "0.2em", fontWeight: "700" }}
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", marginTop: "8px" }}>
              {loading ? "Verifying..." : "Verify & Access App"}
            </button>

            <button type="button" onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "var(--text-subtle)", fontSize: "0.8rem", cursor: "pointer" }}>
              ← Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
