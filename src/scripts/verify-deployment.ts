import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

interface VerificationError {
  file: string
  message: string
  line?: number
}

async function verifyDeployment() {
  const errors: VerificationError[] = []
  
  console.log('🔍 Starting deployment verification...\n')

  // 1. Check required environment variables
  console.log('Checking environment variables...')
  
  // Load .env.local file
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    console.log('Loaded environment variables from .env.local')
  } else {
    console.log('Warning: .env.local file not found')
  }

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push({
        file: '.env.local',  // Changed from .env to .env.local
        message: `Missing required environment variable: ${envVar}`
      })
    } else {
      console.log(`✓ Found ${envVar}`)
    }
  })

  // 2. Verify TypeScript compilation
  console.log('\nVerifying TypeScript compilation...')
  try {
    execSync('tsc --noEmit', { stdio: 'pipe' })
  } catch (error: any) {
    const output = error.output.toString()
    const typeErrors = output.match(/(?:\.\/)?([^:]+):(\d+):(\d+) - error TS\d+: (.+)$/gm)
    
    if (typeErrors) {
      typeErrors.forEach((errorMatch: string) => {
        const [file, line, , message] = errorMatch.split(':')
        errors.push({
          file: file.replace('./', ''),
          line: parseInt(line),
          message: message.trim()
        })
      })
    }
  }

  // 3. Check district boundaries type consistency
  console.log('\nChecking district boundaries data...')
  const districtBoundariesPath = path.join(process.cwd(), 'src/data/districts/boundaries.ts')
  if (fs.existsSync(districtBoundariesPath)) {
    const boundaries = require(districtBoundariesPath).districtBoundaries
    Object.entries(boundaries).forEach(([districtId, coords]: [string, any]) => {
      if (!Array.isArray(coords) || !coords.every((coord: number[]) => 
        Array.isArray(coord) && coord.length === 2 && 
        typeof coord[0] === 'number' && typeof coord[1] === 'number'
      )) {
        errors.push({
          file: 'src/data/districts/boundaries.ts',
          message: `Invalid coordinates format for district ${districtId}`
        })
      }
    })
  }

  // 4. Run build in development to catch any build errors
  console.log('\nTesting production build...')
  try {
    execSync('next build', { stdio: 'pipe' })
  } catch (error: any) {
    errors.push({
      file: 'build',
      message: 'Production build failed: ' + error.message
    })
  }

  // Report results
  console.log('\n=== Verification Results ===')
  if (errors.length === 0) {
    console.log('✅ All checks passed! Ready for deployment.')
  } else {
    console.log('❌ Found the following issues:')
    errors.forEach(error => {
      console.log(`\nFile: ${error.file}${error.line ? ` (line ${error.line})` : ''}`)
      console.log(`Error: ${error.message}`)
    })
    process.exit(1)
  }
}

verifyDeployment().catch((error: Error) => {
  console.error('Verification script failed:', error)
  process.exit(1)
}) 