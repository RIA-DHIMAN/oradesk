import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../lib/auth";
import prisma from "../../lib/prisma";
import { logAuditEvent } from "../../lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      await logAuditEvent({
        userId: session.user.id,
        action: "LOGOUT",
        details: `User locked & signed out from device: ${session.deviceLabel || "Unknown"}`,
      });
    }
  } catch (e) {
    console.error("Logout error:", e);
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set("ora_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
