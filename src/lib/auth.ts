import { cookies, headers } from "next/headers";
import prisma from "./prisma";

export function getClientIp(): string {
  const reqHeaders = headers();
  const forwarded = reqHeaders.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return reqHeaders.get("x-real-ip") || "127.0.0.1";
}

export function parseDeviceLabel(agent: string | null): string {
  const a = agent || "";
  const browser =
    a.includes("Edg/") ? "Edge" :
    a.includes("Chrome/") ? "Chrome" :
    a.includes("Firefox/") ? "Firefox" :
    a.includes("Safari/") ? "Safari" : "Browser";

  const system =
    a.includes("iPhone") ? "iPhone" :
    a.includes("iPad") ? "iPad" :
    a.includes("Android") ? "Android" :
    a.includes("Windows") ? "Windows" :
    a.includes("Mac OS") ? "Mac" :
    a.includes("Linux") ? "Linux" : "Device";

  return `${browser} on ${system}`;
}

export async function getCurrentSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("ora_session")?.value;
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          select: {
            id: true,
            loginId: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!session) return null;

    // Check if expired or user deactivated
    if (new Date() > session.expiresAt || !session.user.isActive) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    // Touch last active periodically (every 60 seconds)
    const now = new Date();
    if (now.getTime() - new Date(session.lastActive).getTime() > 60000) {
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActive: now },
      }).catch(() => {});
    }

    return session;
  } catch (error) {
    console.error("Session lookup error:", error);
    return null;
  }
}
