import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

interface VerificationError {
  type: 'env' | 'typescript' | 'build' | 'data' | 'dependency'
  file: string
  message: string
  details?: string[]
  line?: number
}

interface VerificationResult {
  success: boolean
  errors: VerificationError[]
  warnings: string[]
}

async function verifyDeployment(): Promise<VerificationResult> {
  const result: VerificationResult = {
    success: true,
    errors: [],
    warnings: []
  }

  console.log('🔍 Starting comprehensive deployment verification...\n')

  // 1. Check environment variables
  console.log('Checking environment variables...')
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
  } else {
    result.warnings.push('Warning: .env.local file not found')
  }

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  if (missingEnvVars.length > 0) {
    result.errors.push({
      type: 'env',
      file: '.env.local',
      message: 'Missing required environment variables',
      details: missingEnvVars
    })
  }

  // 2. Verify package dependencies
  console.log('Checking package dependencies...')
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const nodeModules = fs.existsSync('node_modules')
    
    if (!nodeModules) {
      result.errors.push({
        type: 'dependency',
        file: 'node_modules',
        message: 'node_modules directory is missing. Run npm install'
      })
    }

    // Check for potential dependency conflicts
    const packageLock = fs.existsSync('package-lock.json')
    if (!packageLock) {
      result.warnings.push('package-lock.json is missing')
    }
  } catch (error) {
    result.errors.push({
      type: 'dependency',
      file: 'package.json',
      message: 'Error reading package.json',
      details: [error instanceof Error ? error.message : 'Unknown error']
    })
  }

  // 3. Verify TypeScript compilation
  console.log('Verifying TypeScript compilation...')
  try {
    execSync('tsc --noEmit', { stdio: 'pipe' })
  } catch (error: any) {
    const output = error.output.toString()
    const typeErrors: VerificationError[] = []
    
    // Parse all TypeScript errors
    const errorLines = output.split('\n')
    let currentFile = ''
    let currentLine = 0
    let currentMessage = ''

    errorLines.forEach((line: string) => {
      // Match file and line number
      const fileMatch = line.match(/^([^:]+):(\d+):(\d+) - error TS\d+: (.+)$/)
      if (fileMatch) {
        // If we have a previous error, push it
        if (currentFile && currentMessage) {
          typeErrors.push({
            type: 'typescript',
            file: currentFile.replace('./', ''),
            line: currentLine,
            message: currentMessage.trim()
          })
        }
        // Start new error - convert line number string to number
        const [, file, lineNum, , message] = fileMatch
        currentFile = file
        currentLine = parseInt(lineNum, 10)
        currentMessage = message
      } else if (line.trim() && currentFile) {
        // Append to current message if it's a continuation
        currentMessage += ' ' + line.trim()
      }
    })

    // Push the last error if exists
    if (currentFile && currentMessage) {
      typeErrors.push({
        type: 'typescript',
        file: currentFile.replace('./', ''),
        line: currentLine,
        message: currentMessage.trim()
      })
    }

    if (typeErrors.length > 0) {
      result.errors.push(...typeErrors)
    }
  }

  // 4. Check data integrity
  console.log('Verifying data integrity...')
  const dataErrors: VerificationError[] = []
  
  // Check district boundaries
  const districtBoundariesPath = path.join(process.cwd(), 'src/data/districts/boundaries.ts')
  if (fs.existsSync(districtBoundariesPath)) {
    try {
      const boundaries = require(districtBoundariesPath).districtBoundaries
      Object.entries(boundaries).forEach(([districtId, coords]: [string, any]) => {
        if (!Array.isArray(coords) || !coords.every((coord: any) => 
          Array.isArray(coord) && coord.length === 2 && 
          typeof coord[0] === 'number' && typeof coord[1] === 'number'
        )) {
          dataErrors.push({
            type: 'data',
            file: 'src/data/districts/boundaries.ts',
            message: `Invalid coordinates format for district ${districtId}`
          })
        }
      })
    } catch (error) {
      dataErrors.push({
        type: 'data',
        file: 'src/data/districts/boundaries.ts',
        message: 'Error parsing district boundaries',
        details: [error instanceof Error ? error.message : 'Unknown error']
      })
    }
  }

  if (dataErrors.length > 0) {
    result.errors.push(...dataErrors)
  }

  // 5. Test production build
  console.log('Testing production build...')
  try {
    execSync('next build', { stdio: 'pipe' })
  } catch (error: any) {
    const buildOutput = error.output.toString()
    const buildErrors: VerificationError[] = []
    
    // Parse build errors - look for all type errors in the output
    const errorSection = buildOutput.split('Failed to compile.')[1] || ''
    
    // Find all file locations with errors - properly type the RegExp matches
    const fileLocations = Array.from(
      errorSection.matchAll(/\.\/(src\/[^:]+):(\d+):(\d+)/g)
    ) as Array<RegExpMatchArray>
    
    for (const match of fileLocations) {
      const [, file, line] = match
      if (!file) continue

      // Find the error block for this file location
      const startIndex = errorSection.indexOf(`./${file}`)
      const nextFileIndex = errorSection.indexOf('./', startIndex + 1)
      const errorBlock = errorSection.slice(
        startIndex,
        nextFileIndex > -1 ? nextFileIndex : undefined
      )

      // Extract all type errors from this block
      const typeErrors = errorBlock
        .split('\n')
        .filter((line: string) => line.includes('Type error:'))
        .map((line: string) => line.replace('Type error:', '').trim())

      // Get the context lines
      const contextLines = errorBlock
        .split('\n')
        .filter((line: string) => 
          !line.includes('Type error:') && 
          !line.includes('./') &&
          line.trim()
        )
        .map((line: string) => line.trim())

      // Add each error with its context
      typeErrors.forEach((error: string) => {
        buildErrors.push({
          type: 'build',
          file,
          line: parseInt(line || '0', 10),
          message: error,
          details: contextLines
        })
      })
    }

    // If we found specific errors, add them
    if (buildErrors.length > 0) {
      result.errors.push(...buildErrors)
    } else {
      // Fallback for other build errors
      result.errors.push({
        type: 'build',
        file: 'build',
        message: 'Production build failed',
        details: buildOutput.split('\n').filter(Boolean)
      })
    }
  }

  // Set overall success status
  result.success = result.errors.length === 0

  // Improve the error output formatting
  console.log('\n=== Verification Summary ===')
  if (result.success) {
    console.log('✅ All checks passed! Ready for deployment.')
  } else {
    console.log('❌ Found issues:\n')
    
    // Group errors by file
    const errorsByFile = result.errors.reduce((acc, error) => {
      const key = `${error.file}:${error.line || 0}`
      if (!acc[key]) acc[key] = []
      acc[key].push(error)
      return acc
    }, {} as Record<string, VerificationError[]>)

    // Print errors grouped by file
    Object.entries(errorsByFile).forEach(([fileKey, errors]) => {
      const [file, line] = fileKey.split(':')
      console.log(`File: ${file}${line !== '0' ? ` (line ${line})` : ''}`)
      
      errors.forEach((error, index) => {
        console.log(`Error ${index + 1}: ${error.message}`)
        if (error.details?.length) {
          console.log('Context:')
          error.details.forEach(detail => console.log(`  ${detail}`))
        }
        console.log() // Add spacing between errors
      })
    })
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:')
    result.warnings.forEach(warning => console.log(`  - ${warning}`))
  }

  return result
}

// Run verification
verifyDeployment()
  .then(result => {
    if (!result.success) {
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('Verification script failed:', error)
    process.exit(1)
  }) 