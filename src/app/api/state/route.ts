import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getCurrentSession } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const rawDocs = await prisma.document.findMany();
    const meta = await prisma.metadata.findUnique({ where: { key: "revision" } });
    const revision = meta ? parseInt(meta.value, 10) || 0 : 0;

    const collections: Record<string, Record<string, any>> = {
      patients: {},
      appointments: {},
      lab: {},
    };
    const settings: Record<string, any> = {};

    for (const doc of rawDocs) {
      try {
        const parsed = JSON.parse(doc.body);
        if (doc.collection === "settings") {
          settings[doc.id] = parsed;
        } else if (collections[doc.collection]) {
          collections[doc.collection][doc.id] = parsed;
        }
      } catch (e) {
        // Skip unparseable document
      }
    }

    return NextResponse.json({
      collections,
      settings,
      revision,
      user: {
        name: session.user.name,
        role: session.user.role,
        loginId: session.user.loginId,
      },
    });
  } catch (err: any) {
    console.error("State API error:", err);
    return NextResponse.json({ error: "Failed to load clinic state." }, { status: 500 });
  }
}
