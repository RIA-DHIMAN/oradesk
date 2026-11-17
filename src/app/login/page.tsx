"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, passcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user?.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, #f0f7f7 0%, #e1efee 100%)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "460px",
        background: "#ffffff",
        border: "1px solid #cce3e3",
        borderRadius: "24px",
        padding: "36px",
        boxShadow: "0 20px 45px rgba(0, 51, 57, 0.08)",
      }}>
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: "#00666b",
            color: "#ffffff",
            fontWeight: 800,
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}>
            OD
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#003339", margin: 0 }}>OraDesk Live</h1>
            <p style={{ margin: 0, fontSize: "14px", color: "#4f6965" }}>Dental & Aesthetic Practice Portal</p>
          </div>
        </div>

        <p style={{ color: "#3b5154", fontSize: "15px", marginBottom: "24px" }}>
          Enter the single-use <b>Login ID</b> and <b>Passcode</b> provided by your Clinic Super Admin.
        </p>

        {error && (
          <div style={{
            background: "#fee4e2",
            border: "1px solid #fecdca",
            color: "#b42318",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#133134", marginBottom: "6px" }}>
              Login ID / Username
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. DOC-101, REC-01, or admin"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              style={{
                width: "100%",
                height: "46px",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1.5px solid #b6d3d4",
                fontSize: "15px",
                outline: "none",
                background: "#fdfdfd",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#133134", marginBottom: "6px" }}>
              Passcode
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={{
                width: "100%",
                height: "46px",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1.5px solid #b6d3d4",
                fontSize: "15px",
                outline: "none",
                background: "#fdfdfd",
              }}
            />
          </div>

          <div style={{
            background: "#f4f8f7",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "13px",
            color: "#4f6965",
            lineHeight: 1.4,
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}>
            <ShieldCheck size={18} style={{ color: "#00666b", flexShrink: 0, marginTop: "1px" }} />
            <span>
              <b>Strict 1-Device Access:</b> Only you can access with this passcode. Signing in here will automatically sign out any previously active device.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: "48px",
              background: "#00666b",
              color: "#ffffff",
              border: 0,
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              marginTop: "6px",
            }}
          >
            {loading ? "Unlocking Clinic…" : "Unlock Portal"}
          </button>
        </form>

        <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #e1efee", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "#667085", margin: 0 }}>
            Do not have credentials? Contact your clinic Super Admin to be issued an access ID and passcode.
          </p>
        </div>
      </div>
    </div>
  );
}
