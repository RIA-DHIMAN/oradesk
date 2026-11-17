import prisma from "./prisma";
import { getClientIp, parseDeviceLabel } from "./auth";
import { headers } from "next/headers";

export async function logAuditEvent({
  userId,
  action,
  details,
}: {
  userId?: string | null;
  action: string;
  details?: string;
}) {
  try {
    const ip = getClientIp();
    const reqHeaders = headers();
    const rawAgent = reqHeaders.get("user-agent") || "";
    const device = parseDeviceLabel(rawAgent);

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        ipAddress: ip,
        device,
        details: details || null,
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}
