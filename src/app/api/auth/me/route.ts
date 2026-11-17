import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      loginId: session.user.loginId,
      name: session.user.name,
      role: session.user.role,
    },
    session: {
      id: session.id,
      deviceLabel: session.deviceLabel,
      ipAddress: session.ipAddress,
      lastActive: session.lastActive,
    },
  });
}
