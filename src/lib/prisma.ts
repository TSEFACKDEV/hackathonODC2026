
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "@prisma/client"

const dbUrl = new URL(process.env.DATABASE_URL!)

const adapter = new PrismaMariaDb({
  host:            dbUrl.hostname,
  port:            parseInt(dbUrl.port || '3306'),
  user:            dbUrl.username,
  password:        decodeURIComponent(dbUrl.password),
  database:        dbUrl.pathname.slice(1),
  connectionLimit: 5,
})

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma