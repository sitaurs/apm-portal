/**
 * Prisma Client Singleton
 * 
 * This module provides a singleton instance of PrismaClient that is reused
 * across all requests in development (prevents connection pool exhaustion)
 * and properly handles production environments.
 * 
 * Prisma 7 requires a driver adapter for database connections.
 */

import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg

// Declare global type for PrismaClient singleton
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
  // eslint-disable-next-line no-var  
  var pgPool: pg.Pool | undefined
}

/**
 * Get or create the PostgreSQL connection pool
 */
function getPool(): pg.Pool {
  if (globalThis.pgPool) {
    return globalThis.pgPool
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    // During build time, DATABASE_URL might not be available
    // This will only throw error when actually trying to query
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const pool = new Pool({ connectionString })
  
  if (process.env.NODE_ENV !== 'production') {
    globalThis.pgPool = pool
  }

  return pool
}

/**
 * Create PrismaClient with pg adapter
 */
function createPrismaClient(): PrismaClient {
  const pool = getPool()
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({ adapter })
}

/**
 * Get or create the PrismaClient singleton instance (lazy initialization)
 * 
 * In development, we store the client in the global object to prevent
 * creating a new connection pool on every hot reload.
 * 
 * In production, we create a new client instance.
 */
function getPrismaClient(): PrismaClient {
  if (globalThis.prisma) {
    return globalThis.prisma
  }

  const client = createPrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = client
  }

  return client
}

// Export lazy-initialized prisma client
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient()
    return client[prop as keyof PrismaClient]
  }
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production' && globalThis.prisma) {
  // Already initialized in global, reuse it
}

/**
 * Disconnect from the database
 * Used for cleanup in tests or when shutting down the server
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect()
  if (globalThis.pgPool) {
    await globalThis.pgPool.end()
  }
}

/**
 * Health check - verify database connection
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Export types from Prisma
export * from '../generated/prisma'
