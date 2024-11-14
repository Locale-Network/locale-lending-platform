import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const neon = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL,
});
const adapter = new PrismaNeon(neon);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
