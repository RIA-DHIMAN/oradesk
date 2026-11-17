import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const documents = await prisma.document.findMany();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    const backupData = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      documents: documents.map((d) => ({
        collection: d.collection,
        id: d.id,
        body: JSON.parse(d.body),
        updatedAt: d.updatedAt,
      })),
      users,
    };

    const json = JSON.stringify(backupData, null, 2);
    const dateStr = new Date().toISOString().split("T")[0];

    return new Response(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="OraDesk-Web-Backup-${dateStr}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create backup." }, { status: 500 });
  }
}
