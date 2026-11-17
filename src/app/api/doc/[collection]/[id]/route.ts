import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED_COLLECTIONS = new Set(["patients", "appointments", "lab", "settings"]);

export async function PUT(
  req: Request,
  { params }: { params: { collection: string; id: string } }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { collection, id } = params;
  const decodedId = decodeURIComponent(id);

  if (!ALLOWED_COLLECTIONS.has(collection) || !decodedId) {
    return NextResponse.json({ error: "Invalid collection or ID." }, { status: 400 });
  }

  try {
    const value = await req.json();
    if (!value || typeof value !== "object") {
      return NextResponse.json({ error: "Document body must be a JSON object." }, { status: 400 });
    }

    const bodyString = JSON.stringify(value);

    // Upsert document
    await prisma.document.upsert({
      where: {
        collection_id: {
          collection,
          id: decodedId,
        },
      },
      update: {
        body: bodyString,
      },
      create: {
        collection,
        id: decodedId,
        body: bodyString,
      },
    });

    // Increment revision
    const meta = await prisma.metadata.findUnique({ where: { key: "revision" } });
    const currentRev = meta ? parseInt(meta.value, 10) || 0 : 0;
    await prisma.metadata.upsert({
      where: { key: "revision" },
      update: { value: String(currentRev + 1) },
      create: { key: "revision", value: "1" },
    });

    return NextResponse.json({ saved: true });
  } catch (err: any) {
    console.error("PUT document error:", err);
    return NextResponse.json({ error: "Failed to save document." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { collection: string; id: string } }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { collection, id } = params;
  const decodedId = decodeURIComponent(id);

  if (!ALLOWED_COLLECTIONS.has(collection) || !decodedId) {
    return NextResponse.json({ error: "Invalid collection or ID." }, { status: 400 });
  }

  try {
    await prisma.document.deleteMany({
      where: {
        collection,
        id: decodedId,
      },
    });

    // Increment revision
    const meta = await prisma.metadata.findUnique({ where: { key: "revision" } });
    const currentRev = meta ? parseInt(meta.value, 10) || 0 : 0;
    await prisma.metadata.upsert({
      where: { key: "revision" },
      update: { value: String(currentRev + 1) },
      create: { key: "revision", value: "1" },
    });

    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    console.error("DELETE document error:", err);
    return NextResponse.json({ error: "Failed to delete document." }, { status: 500 });
  }
}
