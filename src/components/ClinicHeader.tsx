"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Shield, LogOut } from "lucide-react";

interface UserProp {
  id: string;
  loginId: string;
  name: string;
  role: string;
}

export default function ClinicHeader({ user }: { user: UserProp }) {
  const router = useRouter();

  // If user is a client/staff (not Super Admin), DO NOT render this header bar at all
  if (user.role !== "SUPER_ADMIN") {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      router.push("/login");
    }
  };

  return (
    <>
      <style>{`
        .clinic-admin-nav { min-height: 48px; margin: 10px 16px 0; padding: 6px 12px; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; flex: none; z-index: 50; color: #ffffff; background: #003339; border: 1px solid #004d53; border-radius: 999px; box-shadow: 0 4px 14px rgba(0,51,57,.12); }
        .clinic-admin-brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
        .clinic-admin-logo { width: 30px; height: 30px; flex: 0 0 30px; display: grid; place-items: center; border-radius: 9px; background: #00666b; color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: -.5px; }
        .clinic-admin-wordmark { color: #e1f5f5; font-size: 14px; font-weight: 800; letter-spacing: .2px; white-space: nowrap; }
        .clinic-admin-right { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .clinic-admin-actions { display: flex; align-items: center; gap: 7px; }
        .clinic-admin-action { height: 34px; padding: 0 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid #00666b; border-radius: 999px; background: #00666b; color: #ffffff; font-size: 11px; font-weight: 700; text-decoration: none; white-space: nowrap; }
        .clinic-admin-logout { border-color: #8f2119; background: #8f2119; cursor: pointer; }
        @media (max-width: 768px) {
          .clinic-admin-nav { min-height: 44px; margin: 8px 10px 0; padding: 5px 8px; gap: 8px; border-radius: 999px; }
          .clinic-admin-action-label { display: none; }
          .clinic-admin-action { width: 34px; height: 34px; padding: 0; }
          .clinic-admin-brand { gap: 8px; }
          .clinic-admin-actions { gap: 6px; }
        }
        @media (max-width: 380px) {
          .clinic-admin-nav { margin: 6px 7px 0; padding: 5px 7px; gap: 6px; }
          .clinic-admin-brand { gap: 7px; }
          .clinic-admin-wordmark { font-size: 12px; }
          .clinic-admin-action { width: 32px; height: 32px; }
          .clinic-admin-actions { gap: 4px; }
        }
      `}</style>
      <header className="clinic-admin-nav" aria-label="Clinic administration navigation">
        <div className="clinic-admin-brand">
          <div className="clinic-admin-logo" aria-label="OraDesk">OD</div>
          <span className="clinic-admin-wordmark">OraDesk Live</span>
        </div>

        <div className="clinic-admin-right">
          <nav className="clinic-admin-actions" aria-label="Admin actions">
            <a href="/admin" className="clinic-admin-action" aria-label="Super Admin Dashboard" title="Super Admin Dashboard">
              <Shield size={14} /><span className="clinic-admin-action-label">Super Admin Dashboard</span>
            </a>

            <button onClick={handleLogout} className="clinic-admin-action clinic-admin-logout" aria-label="Lock and sign out" title="Lock and sign out">
              <LogOut size={14} /><span className="clinic-admin-action-label">Lock & Sign Out</span>
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
