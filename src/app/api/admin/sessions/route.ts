import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const sessions = await prisma.session.findMany({
      orderBy: { lastActive: "desc" },
      include: {
        user: {
          select: {
            id: true,
            loginId: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ sessions });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load sessions." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const current = await getCurrentSession();
  if (!current || current.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { action, sessionId, userId } = await req.json();

    if (action === "revoke_session" && sessionId) {
      const target = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });

      if (target) {
        await prisma.session.delete({ where: { id: sessionId } });
        await logAuditEvent({
          userId: current.user.id,
          action: "REVOKE_SESSION",
          details: `Super Admin kicked out session on ${target.deviceLabel} (IP: ${target.ipAddress}) for user ${target.user.name}`,
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "revoke_user" && userId) {
      await prisma.session.deleteMany({ where: { userId } });
      await logAuditEvent({
        userId: current.user.id,
        action: "REVOKE_ALL_SESSIONS",
        details: `Super Admin terminated all active sessions for user ID: ${userId}`,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "Operation failed." }, { status: 500 });
  }
}
