import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentSession } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

// Require Super Admin role
async function checkSuperAdmin() {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

// GET: List all users with passwords, IPs, sessions, and status
export async function GET() {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sessions: {
          select: {
            id: true,
            ipAddress: true,
            deviceLabel: true,
            lastActive: true,
            createdAt: true,
          },
        },
        _count: {
          select: { sessions: true },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("Fetch users error:", err);
    return NextResponse.json({ error: "Failed to load users." }, { status: 500 });
  }
}

// POST: Super Admin creates a new client/staff account
export async function POST(req: Request) {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { loginId, name, role, passcode } = body;

    if (!loginId || !passcode || !name) {
      return NextResponse.json({ error: "Name, Login ID, and passcode are required." }, { status: 400 });
    }

    const trimmedLogin = String(loginId).trim();
    const existing = await prisma.user.findUnique({
      where: { loginId: trimmedLogin },
    });

    if (existing) {
      return NextResponse.json({ error: `Login ID "${trimmedLogin}" is already in use.` }, { status: 409 });
    }

    const passcodeHash = await bcrypt.hash(passcode, 10);

    const newUser = await prisma.user.create({
      data: {
        loginId: trimmedLogin,
        name: String(name).trim(),
        role: role || "STAFF",
        plainPasscode: passcode, // Saved so Super Admin can always view and supply it to the client
        passcodeHash: passcodeHash,
        isActive: true,
      },
    });

    await logAuditEvent({
      userId: session.user.id,
      action: "CREATE_USER",
      details: `Super Admin created ${newUser.role} user: ${newUser.name} (Login ID: ${newUser.loginId})`,
    });

    return NextResponse.json({ ok: true, user: newUser }, { status: 201 });
  } catch (err: any) {
    console.error("Create user error:", err);
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
  }
}

// PUT: Super Admin updates user details (passcode, role, name, active status)
export async function PUT(req: Request) {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, name, role, passcode, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
      // If deactivating user, terminate all their active sessions immediately!
      if (!updateData.isActive) {
        await prisma.session.deleteMany({ where: { userId: id } });
      }
    }
    if (passcode !== undefined && passcode.trim().length > 0) {
      updateData.plainPasscode = passcode.trim();
      updateData.passcodeHash = await bcrypt.hash(passcode.trim(), 10);
      // When passcode changes, revoke their active sessions so they must re-authenticate
      await prisma.session.deleteMany({ where: { userId: id } });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      userId: session.user.id,
      action: "UPDATE_USER",
      details: `Super Admin updated user "${updated.loginId}" (Name: ${updated.name}, Active: ${updated.isActive})`,
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (err: any) {
    console.error("Update user error:", err);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}

// DELETE: Super Admin deletes a user
export async function DELETE(req: Request) {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    // Do not allow Super Admin to delete themselves
    if (id === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own Super Admin account." }, { status: 400 });
    }

    const deleted = await prisma.user.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: session.user.id,
      action: "DELETE_USER",
      details: `Super Admin deleted user "${deleted.loginId}" (${deleted.name})`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Delete user error:", err);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
