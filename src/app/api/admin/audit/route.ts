import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getCurrentSession } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: {
            loginId: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load audit logs." }, { status: 500 });
  }
}
