import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getClientIp, parseDeviceLabel } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { loginId, passcode } = await req.json();

    if (!loginId || !passcode) {
      return NextResponse.json({ error: "Login ID and passcode are required." }, { status: 400 });
    }

    const trimmedLogin = String(loginId).trim();
    const user = await prisma.user.findUnique({
      where: { loginId: trimmedLogin },
    });

    const ip = getClientIp();
    const userAgent = req.headers.get("user-agent") || "";
    const deviceLabel = parseDeviceLabel(userAgent);

    if (!user) {
      await logAuditEvent({
        action: "FAILED_LOGIN",
        details: `Unknown user attempt: "${trimmedLogin}"`,
      });
      return NextResponse.json({ error: "Access denied. Invalid credentials." }, { status: 401 });
    }

    if (!user.isActive) {
      await logAuditEvent({
        userId: user.id,
        action: "BLOCKED_LOGIN",
        details: `Deactivated user "${user.loginId}" attempted login.`,
      });
      return NextResponse.json(
        { error: "Account access has been deactivated. Please contact your administrator." },
        { status: 403 }
      );
    }

    const matches = await bcrypt.compare(passcode, user.passcodeHash);
    if (!matches) {
      await logAuditEvent({
        userId: user.id,
        action: "FAILED_LOGIN",
        details: `Incorrect passcode for user "${user.loginId}".`,
      });
      return NextResponse.json({ error: "Access denied. Invalid credentials." }, { status: 401 });
    }

    // Enforce "one access only" (single active device session):
    // Delete any previous sessions for this user so they can't be logged in simultaneously on another device
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Create a new session token
    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days validity

    await prisma.session.create({
      data: {
        sessionToken: token,
        userId: user.id,
        ipAddress: ip,
        userAgent: userAgent.slice(0, 500),
        deviceLabel: deviceLabel,
        lastActive: now,
        expiresAt: expiresAt,
      },
    });

    // Update user's latest access metadata
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastIp: ip,
        lastLogin: now,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "LOGIN",
      details: `Signed in on ${deviceLabel} (IP: ${ip}). Previous sessions terminated.`,
    });

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        role: user.role,
      },
    });

    // Set secure cookie
    response.cookies.set("ora_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 90 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
