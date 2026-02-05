/**
 * Migration script to add email and nip fields
 * Run with: npx tsx scripts/add-email-fields.ts
 */

import { prisma } from '../lib/prisma/client'

async function main() {
  console.log('Starting migration...')
  
  try {
    // Add email field to team_members
    await prisma.$executeRawUnsafe(`
      ALTER TABLE apm_prestasi_team_members 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255)
    `)
    console.log('✓ Added email field to apm_prestasi_team_members')
    
    // Add nip field to pembimbing
    await prisma.$executeRawUnsafe(`
      ALTER TABLE apm_prestasi_pembimbing 
      ADD COLUMN IF NOT EXISTS nip VARCHAR(100)
    `)
    console.log('✓ Added nip field to apm_prestasi_pembimbing')
    
    // Add email field to pembimbing
    await prisma.$executeRawUnsafe(`
      ALTER TABLE apm_prestasi_pembimbing 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255)
    `)
    console.log('✓ Added email field to apm_prestasi_pembimbing')
    
    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

main()
