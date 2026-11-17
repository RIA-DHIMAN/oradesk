import { NextResponse } from "next/server";
import { getCurrentSession } from "../../lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", "http://localhost:3000"));
  }

  try {
    const filePath = path.join(process.cwd(), "src", "clinic.html");
    const htmlContent = fs.readFileSync(filePath, "utf-8");

    return new Response(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: any) {
    console.error("Failed to load clinic view:", err);
    return new Response("Clinic view unavailable", { status: 500 });
  }
}
