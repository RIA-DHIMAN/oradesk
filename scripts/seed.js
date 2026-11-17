const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Load .env if present
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  });
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initializing OraDesk Web database...");

  const adminLogin = process.env.SUPER_ADMIN_LOGIN;
  const adminPass = process.env.SUPER_ADMIN_PASSWORD;

  if (!adminLogin || !adminPass) {
    throw new Error("SUPER_ADMIN_LOGIN and SUPER_ADMIN_PASSWORD must be set before seeding.");
  }

  const adminHash = await bcrypt.hash(adminPass, 10);

  // Upsert Super Admin
  const admin = await prisma.user.upsert({
    where: { loginId: adminLogin },
    update: {
      plainPasscode: adminPass,
      passcodeHash: adminHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      name: "Master Super Admin",
      loginId: adminLogin,
      role: "SUPER_ADMIN",
      plainPasscode: adminPass,
      passcodeHash: adminHash,
      isActive: true,
    },
  });

  console.log("✅ Super Admin configured!");
  console.log(`   Login ID: ${admin.loginId}`);

  // Initialize revision metadata
  await prisma.metadata.upsert({
    where: { key: "revision" },
    update: {},
    create: { key: "revision", value: "1" },
  });

  // Initialize default clinic settings document if not present
  const defaultSettings = {
    clinic: {
      name: "OraDesk Clinic",
      doctor: "Dr. Lead Specialist",
      phone: "+91 98765 43210",
      email: "clinic@oradesk.local",
      address: "Suite 101, Medical Enclave",
      cur: "₹",
    },
    chairs: ["Chair 1", "Chair 2"],
    dayStart: 9,
    dayEnd: 19,
    fees: {
      "Consultation": 500,
      "Root Canal Treatment": 3500,
      "Composite Restoration": 1200,
      "Scaling & Polishing": 1000,
      "Crown / Ceramic": 4500,
      "Botox 20 Units": 8000,
      "Dermal Filler 1ml": 14000,
    },
  };

  await prisma.document.upsert({
    where: {
      collection_id: {
        collection: "settings",
        id: "clinic",
      },
    },
    update: {},
    create: {
      collection: "settings",
      id: "clinic",
      body: JSON.stringify(defaultSettings),
    },
  });

  console.log("✅ Default clinic configuration seeded.");
  console.log("🎉 Database ready!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
