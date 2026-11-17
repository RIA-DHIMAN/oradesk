import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClinicHeader from "@/components/ClinicHeader";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* Top Clinic Master Header (Only visible to Super Admin; completely hidden for clients/doctors) */}
      {isSuperAdmin && <ClinicHeader user={session.user} />}

      {/* Main Clinical Management Workspace */}
      <iframe
        src="/clinic-view"
        title="OraDesk Clinic System"
        style={{
          flex: 1,
          width: "100%",
          height: isSuperAdmin ? "calc(100vh - 44px)" : "100vh",
          border: 0,
          display: "block",
          background: "#f7f7f8",
        }}
      />
    </div>
  );
}
