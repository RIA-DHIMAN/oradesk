# OraDesk Web App (Next.js + MySQL)

A modern, cloud-ready, multi-user web version of **OraDesk** built with **Next.js 14**, **Prisma ORM**, and **MySQL**. It features complete role-based access control, strict single-device session enforcement, client passcode provisioning, real-time IP tracking, and an administrative security audit log while maintaining 100% of OraDesk's original clinical capabilities.

---

## Key Features

1. **Super Admin Control Panel (`/admin`)**:
   * **Client & Staff Provisioning:** Create new staff/client accounts (Doctor, Receptionist, Staff) with auto-generated or custom **Login IDs** and **Passcodes**.
   * **Password Visibility & Control:** Super Admin can always view, copy, edit, or reset the plain passcodes and provide them directly to clients.
   * **Instant Disable Switch:** One-click toggle to disable any account, immediately terminating their access.
   * **Live Connected Device & IP Monitor:** View all active logged-in sessions with device labels (e.g. *Chrome on Windows*, *Safari on iPad*), remote IP addresses, and last active timestamps.
   * **One-Click Session Termination:** Remotely kick out any device or terminate all sessions for a user.
   * **Tamper-Evident Audit Trail:** Detailed log of all logins, failed attempts, account creations, and administrative actions with IP and device info.
   * **Full Database Backup Download:** Export all documents and clinical records as JSON with one click.

2. **Client Access Restriction (`/login`)**:
   * Clients and staff cannot self-register.
   * Access is strictly restricted: users can **only** log in if they enter the Login ID and Passcode provided by the Super Admin.
   * **Strict Single-Device Access:** Logging in from a new device automatically terminates any previous session for that user account.

3. **100% Preserved Clinical Functionality (`/`)**:
   * **Today View:** Daily appointments, waiting room arrivals, patients seen counter, follow-ups due.
   * **Schedule:** Multi-chair calendar booking, visit durations, procedures.
   * **Patients:**
     * Adult & pediatric tooth charts with FDI numbering (11–48, 51–85) and surface condition mapping (decay, filled, crown, missing, implant, etc.).
     * Facial aesthetics mapping zones (Forehead, Glabella, Crow's feet, Bunny lines, Lips, Marionette, etc.) with Botox units & filler volumes.
     * Clinical treatment plans, staging, clinical notes history.
     * Billing ledger, procedure fees, discounts, payments, balance due.
   * **Lab Tracker:** Laboratory work orders, prosthetic types, sent/due dates, and stages.
   * **Finance:** Daily collections and ledger reports.
   * **Clinic Setup:** Doctor details, fees catalog, day start/end, and currency symbols.
   * **Built-in Offline PDF Engine:** One-click downloads for invoices, prescriptions, and day lists.

---

## Project Structure

```
oradesk-web-app/
├── prisma/
│   └── schema.prisma         # MySQL database schema (User, Session, AuditLog, Document, Metadata)
├── scripts/
│   └── seed.js               # Database seeding script (Super Admin & default settings)
├── public/
│   ├── assets/               # OraDesk branding icons & logos
│   └── oradesk-bridge.js     # Client data bridge & built-in offline PDF generator
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Global HTML layout & metadata
│   │   ├── page.tsx          # Main protected clinic interface with ClinicHeader
│   │   ├── login/page.tsx    # Client & Admin Login portal
│   │   ├── admin/page.tsx    # Super Admin Control Panel
│   │   ├── clinic-view/      # Protected clinical workspace view
│   │   └── api/
│   │       ├── auth/         # Login, Logout, and Current User endpoints
│   │       ├── admin/        # Users management, active sessions, and audit log endpoints
│   │       ├── state/        # Real-time clinical collections & settings
│   │       ├── doc/[coll]/   # Document PUT & DELETE handlers
│   │       └── backup/       # Full JSON backup export endpoint
│   ├── components/
│   │   └── ClinicHeader.tsx  # Top clinical workspace banner with user info & quick links
│   ├── lib/
│   │   ├── prisma.ts         # Prisma Client singleton
│   │   ├── auth.ts           # Session validation, cookie parsing, IP & device detection
│   │   └── audit.ts          # Audit logging helper
│   ├── middleware.ts         # Route protection (redirects unauthenticated users to /login)
│   └── clinic.html           # Full OraDesk clinic UI with SVG charts
├── .env                      # Database connection string and Super Admin secrets
├── next.config.mjs
└── package.json
```

---

## Getting Started

### 1. Configure MySQL Database
Edit `.env` with your MySQL connection string (e.g. from local XAMPP or Hostinger MySQL):
```env
DATABASE_URL="mysql://username:password@localhost:3306/oradesk_db"

SUPER_ADMIN_LOGIN="admin"
SUPER_ADMIN_PASSWORD="SuperAdmin@OraDesk2026"
```

### 2. Push Schema to MySQL & Seed Database
```bash
# Push database tables to MySQL
npm run prisma:push

# Seed Super Admin and default clinic settings
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---
