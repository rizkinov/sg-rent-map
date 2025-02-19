import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

interface VerificationError {
  type: 'env' | 'build' | 'database' | 'dependency' | 'typescript'
  message: string
  details?: string[]
}

async function verifyDeployment() {
  const errors: VerificationError[] = []
  console.log('🔍 Starting pre-deployment verification...\n')

  // 1. Check Required Files
  console.log('Checking required files...')
  const requiredFiles = [
    'next.config.js',
    'package.json',
    'tsconfig.json',
    'tailwind.config.js',
    '.env.local',
    'vercel.json'
  ]

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      errors.push({
        type: 'build',
        message: `Missing required file: ${file}`
      })
    }
  }

  // 2. Check Environment Variables
  console.log('Checking environment variables...')
  dotenv.config({ path: path.join(process.cwd(), '.env.local') })
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  if (missingEnvVars.length > 0) {
    errors.push({
      type: 'env',
      message: 'Missing required environment variables',
      details: missingEnvVars
    })
  }

  // 3. Check Database Connection
  if (!errors.some(e => e.type === 'env')) {
    console.log('Verifying database connection...')
    try {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { error } = await supabase.from('properties').select('*', { count: 'exact', head: true })
      if (error) throw error
      
    } catch (error: any) {
      errors.push({
        type: 'database',
        message: 'Failed to connect to database',
        details: [error.message]
      })
    }
  }

  // 4. Check Dependencies
  console.log('Checking dependencies...')
  try {
    execSync('npm list --json', { stdio: 'pipe' })
  } catch (error: any) {
    // Only add error if it's not just about peer dependencies
    if (!error.stdout?.toString().includes('peer dep missing')) {
      errors.push({
        type: 'dependency',
        message: 'Dependency check failed',
        details: [error.message]
      })
    }
  }

  // 5. Check TypeScript Compilation
  console.log('Checking TypeScript compilation...')
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' })
  } catch (error: any) {
    const output = error.stdout?.toString() || error.message
    errors.push({
      type: 'typescript',
      message: 'TypeScript compilation failed',
      details: output.split('\n').filter(Boolean)
    })
  }

  // 6. Test Production Build
  if (!errors.length) {
    console.log('Testing production build...')
    try {
      execSync('npm run build', { stdio: 'pipe' })
    } catch (error: any) {
      const output = error.stdout?.toString() || error.message
      errors.push({
        type: 'build',
        message: 'Production build failed',
        details: output.split('\n').filter(Boolean)
      })
    }
  }

  // Report Results
  console.log('\n=== Verification Results ===')
  if (errors.length === 0) {
    console.log('✅ All checks passed! Ready for deployment.')
    return true
  } else {
    console.log('❌ Found the following issues:')
    errors.forEach(error => {
      console.log(`\n${error.type.toUpperCase()} Error:`)
      console.log(`Message: ${error.message}`)
      if (error.details?.length) {
        console.log('Details:')
        error.details.forEach(detail => console.log(`  - ${detail}`))
      }
    })
    return false
  }
}

// Run verification
console.log('Starting deployment verification...')
verifyDeployment()
  .then(success => {
    if (!success) {
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('Verification script failed:', error)
    process.exit(1)
  }) 