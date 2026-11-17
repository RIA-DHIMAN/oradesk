import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getCurrentSession } from "../../../../lib/auth";
import { logAuditEvent } from "../../../../lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      await logAuditEvent({
        userId: session.user.id,
        action: "LOGOUT",
        details: `User signed out from device: ${session.deviceLabel || "Unknown"}`,
      });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("ora_session", "", {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
