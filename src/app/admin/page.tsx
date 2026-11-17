"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Monitor,
  FileText,
  Download,
  ArrowLeft,
  LogOut,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Edit3,
  Trash2,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Search,
  Key,
  Clock,
  Laptop,
  Activity,
  AlertCircle,
  X,
  Lock,
  Smartphone
} from "lucide-react";

interface User {
  id: string;
  name: string;
  loginId: string;
  role: string;
  plainPasscode: string | null;
  isActive: boolean;
  lastIp: string | null;
  lastLogin: string | null;
  _count?: { sessions: number };
}

interface ActiveSession {
  id: string;
  ipAddress: string | null;
  deviceLabel: string | null;
  lastActive: string;
  createdAt: string;
  user: {
    id: string;
    loginId: string;
    name: string;
    role: string;
  };
}

interface AuditLog {
  id: string;
  action: string;
  ipAddress: string | null;
  device: string | null;
  details: string | null;
  timestamp: string;
  user?: {
    loginId: string;
    name: string;
    role: string;
  } | null;
}

export default function SuperAdminPage() {
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "sessions" | "audit">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasscodes, setVisiblePasscodes] = useState<Record<string, boolean>>({});

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Filtered users based on search and role
  const displayedUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.loginId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.lastIp && u.lastIp.includes(searchQuery));
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Paginated slice (20 rows per page)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayedUsers.slice(start, start + itemsPerPage);
  }, [displayedUsers, currentPage]);

  // Paginated sessions
  const paginatedSessions = useMemo(() => {
    const start = (sessionsPage - 1) * itemsPerPage;
    return sessions.slice(start, start + itemsPerPage);
  }, [sessions, sessionsPage]);

  // Paginated audit logs
  const paginatedLogs = useMemo(() => {
    const start = (auditPage - 1) * itemsPerPage;
    return logs.slice(start, start + itemsPerPage);
  }, [logs, auditPage]);

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLoginId, setNewLoginId] = useState("");
  const [newRole, setNewRole] = useState("DOCTOR");
  const [newPasscode, setNewPasscode] = useState("");

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editPasscode, setEditPasscode] = useState("");
  const [editRole, setEditRole] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersRes, sessionsRes, auditRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/sessions"),
        fetch("/api/admin/audit"),
      ]);

      if (usersRes.status === 401 || usersRes.status === 403) {
        router.push("/login");
        return;
      }

      const usersData = await usersRes.json();
      const sessionsData = await sessionsRes.json();
      const auditData = await auditRes.json();

      setUsers(usersData.users || []);
      setSessions(sessionsData.sessions || []);
      setLogs(auditData.logs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateCredentials = (roleType: string) => {
    const prefix = roleType === "DOCTOR" ? "DOC" : roleType === "RECEPTIONIST" ? "REC" : "STF";
    const randNum = Math.floor(100 + Math.random() * 900);
    setNewLoginId(`OD-${prefix}-${randNum}`);

    // Generate random 8-character secure passcode
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasscode(code);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          loginId: newLoginId,
          role: newRole,
          passcode: newPasscode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      setShowCreateModal(false);
      setNewName("");
      setNewLoginId("");
      setNewPasscode("");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          name: editName,
          role: editRole,
          passcode: editPasscode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");

      setEditingUser(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          isActive: !user.isActive,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.name}" (${user.loginId})? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_session", sessionId }),
      });
      if (!res.ok) throw new Error("Failed to revoke session");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasscodeVisibility = (id: string) => {
    setVisiblePasscodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };



  // Statistics
  const activeCount = users.filter((u) => u.isActive).length;
  const doctorCount = users.filter((u) => u.role === "DOCTOR").length;

  return (
    <div className="admin-dashboard" style={{ minHeight: "100vh", background: "#f4f8f7", display: "flex", flexDirection: "column" }}>
      <style>{`
        .admin-dashboard, .admin-dashboard * { box-sizing: border-box; }
        .admin-dashboard { min-width: 0; overflow-x: hidden; }
        .admin-header {
          margin: 12px 24px 0;
          background: #003339;
          color: #ffffff;
          padding: 10px 18px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 16px;
          border: 1px solid #004d53;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(0,51,57,0.12);
        }
        .admin-header-logo { width: 34px; height: 34px; flex: 0 0 34px; border-radius: 9px; background: #00666b; color: #ffffff; display: grid; place-items: center; font-size: 12px; font-weight: 800; letter-spacing: -0.5px; }
        .admin-header-logo-wrap { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .admin-header-copy { min-width: 0; }
        .admin-header-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .admin-header-title { font-size: 17px; font-weight: 700; margin: 0; letter-spacing: -0.2px; line-height: 1.25; }
        .admin-header-sub { margin: 2px 0 0 0; font-size: 12px; color: #8aa7a8; }
        .admin-header-actions { display: flex; align-items: center; justify-self: end; gap: 10px; }
        .admin-header-btn {
          height: 36px; padding: 0 14px; border-radius: 999px;
          font-size: 13px; font-weight: 600;
          display: inline-flex; align-items: center; gap: 7px;
          text-decoration: none; border: 1px solid #005a63;
          transition: all 0.15s ease; white-space: nowrap;
        }
        .admin-main { max-width: 1320px; width: 100%; margin: 0 auto; padding: 24px; flex: 1; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .tab-bar {
          display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center;
          background: #ffffff; padding: 8px 12px; border-radius: 999px;
          border: 1px solid #dce6e6; margin-bottom: 20px; gap: 8px;
          box-shadow: 0 2px 8px rgba(5,27,29,0.04);
        }
        .tab-buttons { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; min-width: 0; }
        .tab-btn {
          height: 38px; padding: 0 14px; border-radius: 999px; border: 0;
          min-width: 0; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center;
          gap: 7px; cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
        }
        .tab-buttons .tab-btn { justify-content: center; }
        .provide-btn { justify-content: center; }
        .search-filter-bar {
          padding: 16px 20px; border-bottom: 1px solid #f1f5f9;
          display: flex; justify-content: space-between; align-items: center;
          gap: 12px; background: #fcfdfe; flex-wrap: wrap;
        }
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        table { width: 100%; border-collapse: collapse; text-align: left; min-width: 600px; }
        .pagination-bar {
          display: flex; justify-content: flex-end; align-items: center;
          padding: 12px 20px; gap: 8px; border-top: 1px solid #f1f5f9; flex-wrap: wrap;
        }
        .mobile-card {
          display: none;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
        }
        .mobile-record-card { display: grid; gap: 12px; min-width: 0; padding: 14px; border: 1px solid #dce6e6; border-radius: 14px; background: #ffffff; box-shadow: 0 2px 8px rgba(5,27,29,0.04); }
        .mobile-record-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; min-width: 0; }
        .mobile-record-title { min-width: 0; margin: 0 0 6px; color: #051b1d; font-size: 14px; font-weight: 750; overflow-wrap: anywhere; }
        .mobile-record-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 10px; min-width: 0; }
        .mobile-field { display: grid; align-content: start; gap: 4px; min-width: 0; color: #051b1d; font-size: 12px; overflow-wrap: anywhere; }
        .mobile-field-label { color: #4f6965; font-size: 10px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
        .mobile-field-value { min-width: 0; overflow-wrap: anywhere; }
        .mobile-inline-value { display: flex; align-items: center; gap: 5px; min-width: 0; }
        .mobile-inline-value code { max-width: 100%; overflow-wrap: anywhere; }
        .mobile-icon-button { display: inline-grid; place-items: center; flex: 0 0 30px; width: 30px; height: 30px; border: 1px solid #dce6e6; border-radius: 999px; background: #ffffff; color: #4f6965; }
        .mobile-record-actions { display: flex; flex-wrap: wrap; gap: 8px; }
        .mobile-record-actions button { min-height: 36px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 12px; border: 1px solid #dce6e6; border-radius: 999px; background: #ffffff; color: #051b1d; font-size: 12px; font-weight: 700; }
        .mobile-empty-state { padding: 22px 14px; text-align: center; color: #4f6965; font-size: 13px; }
        .mobile-user-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .admin-panel { min-width: 0; }
        .admin-panel-heading { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; background: #fcfdfe; }
        .admin-modal-backdrop { overflow-y: auto; align-items: flex-start !important; }
        .admin-modal { margin: auto; max-height: calc(100dvh - 40px); overflow-y: auto; }
        @media (max-width: 1100px) {
          .admin-header { margin-left: 16px; margin-right: 16px; padding: 10px 14px; gap: 12px; }
          .admin-header-logo-wrap { gap: 10px; }
          .admin-header-title { font-size: 15px !important; }
          .admin-header-actions { gap: 6px; }
          .admin-header-btn { padding-left: 10px; padding-right: 10px; }
        }
        @media (max-width: 768px) {
          .admin-header {
            margin: 10px 10px 0;
            padding: 12px;
            grid-template-columns: 1fr auto;
            gap: 8px;
            border-radius: 20px;
          }
          .admin-header-title-row { min-width: 0; flex-wrap: nowrap; }
          .admin-header-title { min-width: 0; font-size: 14px !important; line-height: 1.25; overflow-wrap: anywhere; }
          .admin-header-logo-wrap div { min-width: 0; }
          .admin-header-logo-wrap h1 { overflow-wrap: anywhere; }
          .admin-header-sub { display: none; }
          .admin-header-logo-wrap { gap: 10px; }
          .admin-header-logo { width: 32px; height: 32px; flex-basis: 32px; }
          .admin-header-badge { display: none !important; }
          .admin-header-btn span, .admin-header-btn-text { display: none; }
          .admin-header-btn { width: 36px; height: 36px; padding: 0; justify-content: center; gap: 0; }
          .admin-header-actions { flex-wrap: nowrap; justify-content: flex-end; gap: 6px; }
          .admin-main { padding: 14px 12px; }
          .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
          .kpi-card { padding: 14px !important; }
          .kpi-label { font-size: 11px !important; }
          .kpi-value { font-size: 22px !important; }
          .kpi-grid div { min-width: 0; }
          .kpi-grid .kpi-description { overflow-wrap: anywhere; }
          .tab-bar { grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 10px; border-radius: 20px; }
          .tab-buttons { width: 100%; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; }
          .tab-btn { padding: 0 6px; font-size: 12px; height: auto; min-height: 40px; white-space: normal; text-align: center; line-height: 1.2; }
          .tab-btn svg { flex: 0 0 auto; }
          .search-filter-bar { flex-direction: column; align-items: stretch; gap: 10px; }
          .admin-search-input { max-width: none !important; }
          .admin-role-filter { justify-content: space-between; }
          .search-filter-bar select { flex: 1; min-width: 0; }
          .admin-panel-heading { padding: 14px 16px !important; }
          .admin-panel-heading h2 { font-size: 15px !important; line-height: 1.35; }
          .admin-panel-heading p { line-height: 1.45; }
          .table-scroll { width: 100%; max-width: 100%; font-size: 12px; }
          .table-scroll { display: none; }
          .mobile-card { display: flex; padding: 12px; }
          table { min-width: 700px; }
          .pagination-bar { justify-content: center; padding: 12px; }
          .provide-btn { width: 100% !important; grid-column: 1 / -1; justify-content: center !important; }
          .admin-modal-backdrop { padding: 12px !important; }
          .admin-modal { padding: 20px !important; border-radius: 14px !important; max-height: calc(100dvh - 24px); }
        }
        @media (max-width: 480px) {
          .admin-header { margin: 8px 8px 0; padding: 10px; grid-template-columns: minmax(0, 1fr) auto; }
          .admin-header-logo-wrap { gap: 8px; }
          .admin-header-title { font-size: 12px !important; }
          .admin-header-logo { width: 30px; height: 30px; flex-basis: 30px; }
          .admin-header-actions { gap: 4px; }
          .admin-header-btn { width: 32px; height: 32px; }
          .kpi-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
          .kpi-card { padding: 12px !important; }
          .kpi-card { padding: 12px !important; }
          .kpi-card-header { gap: 6px !important; align-items: flex-start !important; }
          .kpi-card-label { font-size: 11px !important; line-height: 1.3; }
          .kpi-card-value { flex-wrap: wrap; gap: 4px !important; }
          .mobile-record-card { padding: 12px; }
          .tab-buttons .tab-btn { flex-direction: column; justify-content: center; gap: 4px; min-height: 60px; padding: 6px 4px; font-size: 10px; line-height: 1.15; white-space: normal; }
          .admin-main { padding: 10px 8px; }
          .search-filter-bar { padding: 12px !important; }
          .pagination-bar { gap: 6px; }
          .pagination-bar span { font-size: 12px !important; }
          .admin-modal { padding: 16px !important; }
          .admin-modal h3 { font-size: 16px !important; padding-right: 8px; }
          .admin-modal-actions { flex-direction: column; }
          .admin-modal-actions button { flex: none !important; width: 100%; }
        }
        @media (max-width: 360px) {
          .kpi-grid { grid-template-columns: 1fr; }
          .tab-buttons { grid-template-columns: 1fr; }
          .tab-buttons .tab-btn { flex-direction: row; justify-content: flex-start; min-height: 40px; padding: 0 12px; }
        }
      `}</style>
      {/* Top Admin Header */}
      <header
        className="admin-header"
      >
        <div className="admin-header-logo-wrap">
          <div className="admin-header-logo" aria-label="OraDesk">OD</div>
          <div className="admin-header-copy">
            <div className="admin-header-title-row">
              <h1 className="admin-header-title" style={{ fontSize: "17px", fontWeight: 700, margin: 0, letterSpacing: "-0.2px" }}>
                OraDesk Super Admin Control Panel
              </h1>
              <span
                className="admin-header-badge"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "#00474e",
                  color: "#5eead4",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "999px",
                  border: "1px solid #00666b",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#14b8a6", display: "inline-block" }} />
                Owner Access
              </span>
            </div>
            <p className="admin-header-sub">
              Clinic Provisioning • Single-Device Restriction • Live IP Monitoring
            </p>
          </div>
        </div>

        <div className="admin-header-actions">
          <a
            href="/"
            className="admin-header-btn"
            style={{ background: "#00424a", color: "#e2f1f1" }}
          >
            <ArrowLeft size={15} /><span className="admin-header-btn-text"> Open Clinic App</span>
          </a>

          <a
            href="/api/backup"
            className="admin-header-btn"
            style={{ background: "#00666b", color: "#ffffff", border: "1px solid #008289" }}
          >
            <Download size={15} /><span className="admin-header-btn-text"> Download Backup</span>
          </a>

          <button
            onClick={handleLogout}
            className="admin-header-btn"
            style={{ background: "#8f2119", color: "#ffffff", border: 0, cursor: "pointer" }}
          >
            <LogOut size={15} /><span className="admin-header-btn-text"> Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main">
        {/* KPI Metrics Cards */}
        <div className="kpi-grid">
          {/* Card 1: Users */}
          <div className="kpi-card" style={{ background: "#ffffff", borderRadius: "14px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="kpi-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span className="kpi-card-label" style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Registered Accounts</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
                <Users size={17} />
              </div>
            </div>
            <div className="kpi-card-value" style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a" }}>{users.length}</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a" }}>({activeCount} Active)</span>
            </div>
            <div className="kpi-description" style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
              {doctorCount} Doctors / Specialists provisioned
            </div>
          </div>

          {/* Card 2: Live Sessions */}
          <div className="kpi-card" style={{ background: "#ffffff", borderRadius: "14px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="kpi-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span className="kpi-card-label" style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Live Active Devices</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                <Monitor size={17} />
              </div>
            </div>
            <div className="kpi-card-value" style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a" }}>{sessions.length}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, color: sessions.length > 0 ? "#16a34a" : "#64748b" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sessions.length > 0 ? "#22c55e" : "#94a3b8" }} />
                {sessions.length > 0 ? "Connected now" : "No active users"}
              </span>
            </div>
            <div className="kpi-description" style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
              Real-time active IP connections
            </div>
          </div>

          {/* Card 3: Security Mode */}
          <div className="kpi-card" style={{ background: "#ffffff", borderRadius: "14px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="kpi-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span className="kpi-card-label" style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Single-Device Restriction</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
                <ShieldCheck size={17} />
              </div>
            </div>
            <div className="kpi-card-value" style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "17px", fontWeight: 800, color: "#047857" }}>Strict 1-Device</span>
            </div>
            <div className="kpi-description" style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
              New logins terminate prior sessions automatically
            </div>
          </div>

          {/* Card 4: Audit Count */}
          <div className="kpi-card" style={{ background: "#ffffff", borderRadius: "14px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="kpi-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span className="kpi-card-label" style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Security Audit Events</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#9333ea" }}>
                <Activity size={17} />
              </div>
            </div>
            <div className="kpi-card-value" style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a" }}>{logs.length}</span>
            </div>
            <div className="kpi-description" style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
              Immutable login and credential trail
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="tab-bar">
          <div className="tab-buttons">
            <button
              onClick={() => setTab("users")}
              className="tab-btn"
              style={{ background: tab === "users" ? "#00666b" : "transparent", color: tab === "users" ? "#ffffff" : "#64748b" }}
            >
              <Users size={16} /> Clients & Staff
            </button>

            <button
              onClick={() => setTab("sessions")}
              className="tab-btn"
              style={{ background: tab === "sessions" ? "#00666b" : "transparent", color: tab === "sessions" ? "#ffffff" : "#64748b" }}
            >
              <Monitor size={16} /> Live Active Devices
            </button>

            <button
              onClick={() => setTab("audit")}
              className="tab-btn"
              style={{ background: tab === "audit" ? "#00666b" : "transparent", color: tab === "audit" ? "#ffffff" : "#64748b" }}
            >
              <FileText size={16} /> Access Audit Log
            </button>
          </div>

          {tab === "users" && (
            <button
              onClick={() => {
                handleGenerateCredentials("DOCTOR");
                setShowCreateModal(true);
              }}
              className="tab-btn provide-btn"
              style={{
                background: "#00666b",
                color: "#ffffff",
                border: 0,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0, 102, 107, 0.25)",
              }}
            >
              <Plus size={16} /> Provide New Client Access
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 16px", borderRadius: "10px", marginBottom: "18px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={17} /> {error}
          </div>
        )}

        {/* Tab 1: Clients & Staff */}
        {tab === "users" && (
          <div className="admin-panel" style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {/* Filter / Search Bar */}
            <div className="search-filter-bar">
              <div className="admin-search-input" style={{ position: "relative", maxWidth: "340px", width: "100%" }}>
                <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search by name, Login ID, IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    height: "36px",
                    paddingLeft: "36px",
                    paddingRight: "12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>

              <div className="admin-role-filter" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{
                    height: "36px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#334155",
                    fontWeight: 600,
                    outline: "none",
                    background: "#ffffff",
                  }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="DOCTOR">Doctors</option>
                  <option value="RECEPTIONIST">Receptionists</option>
                  <option value="STAFF">Staff</option>
                  <option value="SUPER_ADMIN">Super Admins</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="table-scroll">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "12px 18px" }}>Client / Staff Name</th>
                    <th style={{ padding: "12px 18px" }}>Role</th>
                    <th style={{ padding: "12px 18px" }}>Login ID</th>
                    <th style={{ padding: "12px 18px" }}>Passcode (Visible to You)</th>
                    <th style={{ padding: "12px 18px" }}>Account Status</th>
                    <th style={{ padding: "12px 18px" }}>Connected IP</th>
                    <th style={{ padding: "12px 18px" }}>Last Login</th>
                    <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        No clients matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => {
                      const isVisible = visiblePasscodes[u.id];
                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s ease" }}>
                          <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0f172a" }}>
                            {u.name}
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <span
                              style={{
                                padding: "3px 9px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.2px",
                                background:
                                  u.role === "SUPER_ADMIN" ? "#f3e8ff" :
                                  u.role === "DOCTOR" ? "#e0f2fe" :
                                  u.role === "RECEPTIONIST" ? "#fef3c7" : "#f1f5f9",
                                color:
                                  u.role === "SUPER_ADMIN" ? "#7e22ce" :
                                  u.role === "DOCTOR" ? "#0369a1" :
                                  u.role === "RECEPTIONIST" ? "#b45309" : "#475569",
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <code style={{ background: "#f1f5f9", padding: "3px 7px", borderRadius: "5px", fontWeight: 700, color: "#0f172a", fontSize: "12px" }}>
                                {u.loginId}
                              </code>
                              <button
                                onClick={() => copyToClipboard(u.loginId, `id-${u.id}`)}
                                title="Copy Login ID"
                                style={{ background: "none", border: 0, cursor: "pointer", color: "#64748b", padding: "2px", display: "flex", alignItems: "center" }}
                              >
                                {copiedId === `id-${u.id}` ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <code
                                style={{
                                  background: "#fef3c7",
                                  color: "#92400e",
                                  padding: "3px 8px",
                                  borderRadius: "5px",
                                  fontWeight: 800,
                                  fontSize: "12px",
                                  letterSpacing: isVisible ? "0.5px" : "1.5px",
                                }}
                              >
                                {isVisible ? (u.plainPasscode || "None") : (u.plainPasscode ? "••••••••" : "None")}
                              </code>
                              {u.plainPasscode && (
                                <>
                                  <button
                                    onClick={() => togglePasscodeVisibility(u.id)}
                                    title={isVisible ? "Hide passcode" : "Reveal passcode"}
                                    style={{ background: "none", border: 0, cursor: "pointer", color: "#64748b", padding: "2px", display: "flex", alignItems: "center" }}
                                  >
                                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(u.plainPasscode!, `pass-${u.id}`)}
                                    title="Copy Passcode"
                                    style={{ background: "none", border: 0, cursor: "pointer", color: "#64748b", padding: "2px", display: "flex", alignItems: "center" }}
                                  >
                                    {copiedId === `pass-${u.id}` ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <button
                              onClick={() => handleToggleActive(u)}
                              title="Click to toggle account access"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "3px 10px",
                                borderRadius: "999px",
                                border: 0,
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                background: u.isActive ? "#f0fdf4" : "#fef2f2",
                                color: u.isActive ? "#15803d" : "#b91c1c",
                              }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: u.isActive ? "#22c55e" : "#ef4444" }} />
                              {u.isActive ? "Active" : "Disabled"}
                            </button>
                          </td>
                          <td style={{ padding: "14px 18px", color: "#64748b", fontSize: "12px" }}>
                            {u.lastIp ? (
                              <code style={{ background: "#f8fafc", padding: "2px 6px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>{u.lastIp}</code>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: "14px 18px", color: "#64748b", fontSize: "12px" }}>
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
                          </td>
                          <td style={{ padding: "14px 18px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setEditName(u.name);
                                  setEditRole(u.role);
                                  setEditPasscode(u.plainPasscode || "");
                                }}
                                style={{
                                  height: "30px",
                                  padding: "0 10px",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  background: "#ffffff",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "#334155",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <Edit3 size={13} /> Edit
                              </button>
                              {u.role !== "SUPER_ADMIN" && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  title="Delete User Account"
                                  style={{
                                    height: "30px",
                                    padding: "0 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #fecaca",
                                    background: "#fef2f2",
                                    fontSize: "12px",
                                    color: "#b91c1c",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="mobile-card" aria-label="Client and staff accounts">
              {displayedUsers.length === 0 ? (
                <div className="mobile-empty-state">No clients matching your search criteria.</div>
              ) : paginatedUsers.map((u) => {
                const isVisible = visiblePasscodes[u.id];
                return (
                  <article className="mobile-record-card" key={`mobile-${u.id}`}>
                    <div className="mobile-record-top">
                      <div style={{ minWidth: 0 }}>
                        <h3 className="mobile-record-title">{u.name}</h3>
                        <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: "999px", background: u.role === "SUPER_ADMIN" ? "#f3e8ff" : u.role === "DOCTOR" ? "#e0f2fe" : u.role === "RECEPTIONIST" ? "#fef3c7" : "#f1f5f9", color: u.role === "SUPER_ADMIN" ? "#7e22ce" : u.role === "DOCTOR" ? "#0369a1" : u.role === "RECEPTIONIST" ? "#b45309" : "#475569", fontSize: "10px", fontWeight: 700 }}>{u.role}</span>
                      </div>
                      <button onClick={() => handleToggleActive(u)} title="Toggle account access" style={{ display: "inline-flex", alignItems: "center", gap: "6px", minHeight: "30px", padding: "0 10px", border: 0, borderRadius: "999px", background: u.isActive ? "#ecfdf3" : "#fee4e2", color: u.isActive ? "#027a48" : "#b42318", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: u.isActive ? "#12b76a" : "#f04438" }} />{u.isActive ? "Active" : "Disabled"}
                      </button>
                    </div>
                    <div className="mobile-record-meta">
                      <div className="mobile-field"><span className="mobile-field-label">Login ID</span><div className="mobile-inline-value"><code>{u.loginId}</code><button className="mobile-icon-button" onClick={() => copyToClipboard(u.loginId, `id-mobile-${u.id}`)} aria-label="Copy Login ID">{copiedId === `id-mobile-${u.id}` ? <Check size={14} /> : <Copy size={14} />}</button></div></div>
                      <div className="mobile-field"><span className="mobile-field-label">Passcode</span><div className="mobile-inline-value"><code>{isVisible ? (u.plainPasscode || "None") : (u.plainPasscode ? "••••••••" : "None")}</code>{u.plainPasscode && <><button className="mobile-icon-button" onClick={() => togglePasscodeVisibility(u.id)} aria-label={isVisible ? "Hide passcode" : "Reveal passcode"}>{isVisible ? <EyeOff size={14} /> : <Eye size={14} />}</button><button className="mobile-icon-button" onClick={() => copyToClipboard(u.plainPasscode!, `pass-mobile-${u.id}`)} aria-label="Copy passcode">{copiedId === `pass-mobile-${u.id}` ? <Check size={14} /> : <Copy size={14} />}</button></>}</div></div>
                      <div className="mobile-field"><span className="mobile-field-label">Connected IP</span><span className="mobile-field-value">{u.lastIp || "—"}</span></div>
                      <div className="mobile-field"><span className="mobile-field-label">Last Login</span><span className="mobile-field-value">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}</span></div>
                    </div>
                    <div className="mobile-record-actions">
                      <button onClick={() => { setEditingUser(u); setEditName(u.name); setEditRole(u.role); setEditPasscode(u.plainPasscode || ""); }}><Edit3 size={14} />Edit</button>
                      {u.role !== "SUPER_ADMIN" && <button onClick={() => handleDeleteUser(u)} style={{ color: "#b42318", borderColor: "#fecdca" }}><Trash2 size={14} />Delete</button>}
                    </div>
                  </article>
                );
              })}
            </div>
          <div className="pagination-bar">
                <button onClick={() => setCurrentPage(p => Math.max(p-1, 1))} disabled={currentPage===1} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: currentPage===1? "#f3f4f6" : "#ffffff", cursor: currentPage===1? "not-allowed" : "pointer" }}>Prev</button>
                <span style={{ fontSize: "13px", color: "#475569" }}>Page {currentPage} of {Math.ceil(displayedUsers.length / itemsPerPage) || 1}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p+1, Math.ceil(displayedUsers.length / itemsPerPage)))} disabled={currentPage===Math.ceil(displayedUsers.length / itemsPerPage) || displayedUsers.length===0} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: currentPage===Math.ceil(displayedUsers.length / itemsPerPage) ? "#f3f4f6" : "#ffffff", cursor: currentPage===Math.ceil(displayedUsers.length / itemsPerPage) ? "not-allowed" : "pointer" }}>Next</button>
              </div>
            </div>
        )}

        {/* Tab 2: Live Active Devices */}
        {tab === "sessions" && (
          <div className="admin-panel" style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="admin-panel-heading">
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Live Active Sessions & Connected Devices
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                Each user is strictly limited to 1 live device. Disconnecting a device revokes access immediately.
              </p>
            </div>

            <div className="table-scroll">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "12px 18px" }}>Connected Client / User</th>
                    <th style={{ padding: "12px 18px" }}>Role</th>
                    <th style={{ padding: "12px 18px" }}>Device & Browser</th>
                    <th style={{ padding: "12px 18px" }}>IP Address</th>
                    <th style={{ padding: "12px 18px" }}>Session Started</th>
                    <th style={{ padding: "12px 18px" }}>Last Activity</th>
                    <th style={{ padding: "12px 18px", textAlign: "right" }}>Remote Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "48px 20px", textAlign: "center", color: "#64748b" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <Laptop size={28} color="#94a3b8" />
                          <span style={{ fontWeight: 600 }}>No clients currently logged in.</span>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>When a doctor or staff member signs in, their device and IP will appear here live.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedSessions.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0f172a" }}>
                          {s.user.name} <span style={{ color: "#64748b", fontWeight: 500, fontSize: "12px" }}>({s.user.loginId})</span>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: 700, background: "#e0f2fe", color: "#0369a1" }}>
                            {s.user.role}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "#334155" }}>
                            <Laptop size={14} color="#64748b" /> {s.deviceLabel || "Standard Web Browser"}
                          </div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <code style={{ background: "#f1f5f9", padding: "3px 7px", borderRadius: "5px", fontWeight: 700, color: "#0f172a" }}>
                            {s.ipAddress || "127.0.0.1"}
                          </code>
                        </td>
                        <td style={{ padding: "14px 18px", color: "#64748b", fontSize: "12px" }}>
                          {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td style={{ padding: "14px 18px", color: "#16a34a", fontWeight: 600, fontSize: "12px" }}>
                          Active {new Date(s.lastActive).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <button
                            onClick={() => handleRevokeSession(s.id)}
                            style={{
                              height: "30px",
                              padding: "0 12px",
                              borderRadius: "6px",
                              border: "1px solid #fecaca",
                              background: "#fef2f2",
                              color: "#b91c1c",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <LogOut size={13} /> Disconnect Device
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mobile-card" aria-label="Active sessions">
              {sessions.length === 0 ? (
                <div className="mobile-empty-state">No clients are currently logged in.</div>
              ) : paginatedSessions.map((s) => (
                <article className="mobile-record-card" key={`mobile-${s.id}`}>
                  <div className="mobile-record-top">
                    <div style={{ minWidth: 0 }}>
                      <h3 className="mobile-record-title">{s.user.name}</h3>
                      <span style={{ color: "#4f6965", fontSize: "12px" }}>{s.user.loginId}</span>
                    </div>
                    <span style={{ display: "inline-flex", padding: "4px 9px", borderRadius: "999px", background: "#ddf1f1", color: "#00666b", fontSize: "10px", fontWeight: 700 }}>{s.user.role}</span>
                  </div>
                  <div className="mobile-record-meta">
                    <div className="mobile-field"><span className="mobile-field-label">Device</span><span className="mobile-field-value">{s.deviceLabel || "Standard Web Browser"}</span></div>
                    <div className="mobile-field"><span className="mobile-field-label">IP Address</span><span className="mobile-field-value">{s.ipAddress || "127.0.0.1"}</span></div>
                    <div className="mobile-field"><span className="mobile-field-label">Session Started</span><span className="mobile-field-value">{new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
                    <div className="mobile-field"><span className="mobile-field-label">Last Activity</span><span className="mobile-field-value" style={{ color: "#027a48", fontWeight: 700 }}>{new Date(s.lastActive).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
                  </div>
                  <div className="mobile-record-actions"><button onClick={() => handleRevokeSession(s.id)} style={{ color: "#b42318", borderColor: "#fecdca" }}><LogOut size={14} />Disconnect Device</button></div>
                </article>
              ))}
            </div>
            {/* Sessions Pagination */}
            <div className="pagination-bar">
              <button onClick={() => setSessionsPage(p => Math.max(p - 1, 1))} disabled={sessionsPage === 1} style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", background: sessionsPage === 1 ? "#f3f4f6" : "#ffffff", cursor: sessionsPage === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>Prev</button>
              <span style={{ fontSize: "13px", color: "#475569" }}>Page {sessionsPage} of {Math.ceil(sessions.length / itemsPerPage) || 1}</span>
              <button onClick={() => setSessionsPage(p => Math.min(p + 1, Math.ceil(sessions.length / itemsPerPage)))} disabled={sessionsPage === Math.ceil(sessions.length / itemsPerPage) || sessions.length === 0} style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", background: sessionsPage === Math.ceil(sessions.length / itemsPerPage) ? "#f3f4f6" : "#ffffff", cursor: sessionsPage === Math.ceil(sessions.length / itemsPerPage) ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>Next</button>
            </div>
          </div>
        )}

        {/* Tab 3: Access Audit Log */}
        {tab === "audit" && (
          <div className="admin-panel" style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="admin-panel-heading">
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Security & Access Audit Trail
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                Tamper-evident system log tracking client logins, single-device terminations, and credential updates.
              </p>
            </div>

            <div className="table-scroll">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "12px 18px" }}>Timestamp</th>
                    <th style={{ padding: "12px 18px" }}>Action</th>
                    <th style={{ padding: "12px 18px" }}>User</th>
                    <th style={{ padding: "12px 18px" }}>IP Address</th>
                    <th style={{ padding: "12px 18px" }}>Device</th>
                    <th style={{ padding: "12px 18px" }}>Activity Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((l) => (
                      <tr key={l.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 18px", color: "#64748b" }}>
                          {new Date(l.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background:
                                l.action === "LOGIN" ? "#f0fdf4" :
                                l.action.includes("REVOKE") || l.action.includes("FAILED") ? "#fef2f2" : "#f1f5f9",
                              color:
                                l.action === "LOGIN" ? "#16a34a" :
                                l.action.includes("REVOKE") || l.action.includes("FAILED") ? "#b91c1c" : "#334155",
                            }}
                          >
                            {l.action}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px", fontWeight: 600, color: "#0f172a" }}>
                          {l.user ? `${l.user.name} (${l.user.loginId})` : "System / Visitor"}
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <code style={{ background: "#f8fafc", padding: "2px 5px", borderRadius: "4px" }}>
                            {l.ipAddress || "—"}
                          </code>
                        </td>
                        <td style={{ padding: "12px 18px", color: "#475569" }}>{l.device || "—"}</td>
                        <td style={{ padding: "12px 18px", color: "#475569" }}>{l.details || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mobile-card" aria-label="Security audit events">
              {logs.length === 0 ? (
                <div className="mobile-empty-state">No audit events recorded yet.</div>
              ) : paginatedLogs.map((l) => {
                const isSuccess = l.action === "LOGIN";
                const isCritical = l.action.includes("REVOKE") || l.action.includes("FAILED");
                return (
                  <article className="mobile-record-card" key={`mobile-${l.id}`}>
                    <div className="mobile-record-top">
                      <span style={{ display: "inline-flex", padding: "4px 9px", borderRadius: "999px", background: isSuccess ? "#ecfdf3" : isCritical ? "#fee4e2" : "#f1f5f9", color: isSuccess ? "#027a48" : isCritical ? "#b42318" : "#334155", fontSize: "10px", fontWeight: 700 }}>{l.action}</span>
                      <span style={{ color: "#4f6965", fontSize: "11px", textAlign: "right" }}>{new Date(l.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="mobile-record-meta">
                      <div className="mobile-field"><span className="mobile-field-label">User</span><span className="mobile-field-value">{l.user ? `${l.user.name} (${l.user.loginId})` : "System / Visitor"}</span></div>
                      <div className="mobile-field"><span className="mobile-field-label">IP Address</span><span className="mobile-field-value">{l.ipAddress || "—"}</span></div>
                      <div className="mobile-field"><span className="mobile-field-label">Device</span><span className="mobile-field-value">{l.device || "—"}</span></div>
                      <div className="mobile-field"><span className="mobile-field-label">Activity Details</span><span className="mobile-field-value">{l.details || "—"}</span></div>
                    </div>
                  </article>
                );
              })}
            </div>
            {/* Audit Log Pagination */}
            <div className="pagination-bar">
              <button onClick={() => setAuditPage(p => Math.max(p - 1, 1))} disabled={auditPage === 1} style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", background: auditPage === 1 ? "#f3f4f6" : "#ffffff", cursor: auditPage === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>Prev</button>
              <span style={{ fontSize: "13px", color: "#475569" }}>Page {auditPage} of {Math.ceil(logs.length / itemsPerPage) || 1}</span>
              <button onClick={() => setAuditPage(p => Math.min(p + 1, Math.ceil(logs.length / itemsPerPage)))} disabled={auditPage === Math.ceil(logs.length / itemsPerPage) || logs.length === 0} style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", background: auditPage === Math.ceil(logs.length / itemsPerPage) ? "#f3f4f6" : "#ffffff", cursor: auditPage === Math.ceil(logs.length / itemsPerPage) ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>Next</button>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Create Client User */}
      {showCreateModal && (
        <div
          className="admin-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 20, 25, 0.45)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 100,
          }}
        >
          <div
            className="admin-modal"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "480px",
              width: "100%",
              padding: "26px",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Provision New Client / Staff Credentials
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: 0, cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              Provide these credentials to the client. Only they will be permitted to unlock the portal.
            </p>

            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                  Client / Doctor Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                  Role & Permissions
                </label>
                <select
                  value={newRole}
                  onChange={(e) => {
                    setNewRole(e.target.value);
                    handleGenerateCredentials(e.target.value);
                  }}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    color: "#334155",
                    fontWeight: 600,
                    outline: "none",
                    background: "#ffffff",
                  }}
                >
                  <option value="DOCTOR">Doctor (Dentist / Aesthetic Specialist)</option>
                  <option value="RECEPTIONIST">Receptionist (Appointments & Front Desk)</option>
                  <option value="STAFF">Staff / Assistant</option>
                  <option value="SUPER_ADMIN">Super Admin (Full Administrative Rights)</option>
                </select>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>Assigned Login ID</label>
                  <button
                    type="button"
                    onClick={() => handleGenerateCredentials(newRole)}
                    style={{ background: "none", border: 0, color: "#00666b", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <RefreshCw size={12} /> Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newLoginId}
                  onChange={(e) => setNewLoginId(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0f172a",
                    outline: "none",
                    background: "#f8fafc",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                  Passcode (Provide this to Client)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #00666b",
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "#9a3412",
                      background: "#fffbeb",
                      outline: "none",
                      letterSpacing: "0.5px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(newPasscode, "new-pass")}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copiedId === "new-pass" ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    {copiedId === "new-pass" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="admin-modal-actions" style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    height: "42px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    height: "42px",
                    borderRadius: "8px",
                    border: 0,
                    background: "#00666b",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0, 102, 107, 0.25)",
                  }}
                >
                  Save & Provision Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Client User Passcode */}
      {editingUser && (
        <div
          className="admin-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 20, 25, 0.45)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 100,
          }}
        >
          <div
            className="admin-modal"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "460px",
              width: "100%",
              padding: "26px",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Update Credentials: {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                style={{ background: "none", border: 0, cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "18px" }}>
              Login ID: <b>{editingUser.loginId}</b>
            </p>

            <form onSubmit={handleSaveEditUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                  Staff / Client Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    background: "#ffffff",
                    color: "#334155",
                    fontWeight: 600,
                  }}
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="STAFF">Staff</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                  Passcode (Update & Provide to Client)
                </label>
                <input
                  type="text"
                  required
                  value={editPasscode}
                  onChange={(e) => setEditPasscode(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid #00666b",
                    fontSize: "15px",
                    fontWeight: 800,
                    color: "#9a3412",
                    background: "#fffbeb",
                    outline: "none",
                  }}
                />
              </div>

              <div className="admin-modal-actions" style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    flex: 1,
                    height: "42px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    height: "42px",
                    borderRadius: "8px",
                    border: 0,
                    background: "#00666b",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

