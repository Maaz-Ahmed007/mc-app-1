import { PrismaClient } from "@prisma/client"
import path from 'path'
import fs from 'fs'

declare global {
  var prisma: PrismaClient | undefined
}

const dbPath = path.join(process.cwd(), 'data', 'dev.db')
const databaseUrl = `file:${dbPath}`

const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '')
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
}

const prisma = global.prisma ?? prismaClientSingleton()

export const prismadb = prisma

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

export async function initializeDatabase() {
  try {
    await prisma.$connect()

    const tableInfo = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='Section'`
    
    if (Array.isArray(tableInfo) && tableInfo.length === 0) {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS Section (
          id TEXT PRIMARY KEY,
          sectionName TEXT NOT NULL
        )
      `
    }
  } catch (error) {
    throw error;
  }
}