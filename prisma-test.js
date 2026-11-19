const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$connect()
  .then(() => console.log('✅ Connected to Hostinger MySQL'))
  .catch(e => console.error('❌ Connection failed:', e.message))
  .finally(() => prisma.$disconnect());
