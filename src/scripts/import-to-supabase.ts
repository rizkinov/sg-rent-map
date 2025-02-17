import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { config } from './config'
import crypto from 'crypto'
import { z } from 'zod'

// Validation schema
const PropertySchema = z.object({
  property_name: z.string().min(1),
  property_type: z.enum(['Condo', 'HDB', 'Landed']),
  district: z.number().nullable(),
  price: z.number().positive(),
  beds: z.number()
    .nullable()
    .transform(val => (val === null || val < 0) ? 0 : val),
  baths: z.number().nullable(),
  sqft: z.number().positive(),
  mrt: z.string().nullable(),
  completion_year: z.number().nullable(),
  url: z.string().url()
})

type ValidatedProperty = z.infer<typeof PropertySchema>

// Add interfaces for validation results
interface ValidationSuccess {
  success: true
  data: ValidatedProperty
}

interface ValidationError {
  success: false
  error: z.ZodError
  data: Record<string, any>
}

type ValidationResult = ValidationSuccess | ValidationError

async function importData() {
  const supabase = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Create backup of existing data
  console.log('Creating backup...')
  const { data: existingData, error: backupError } = await supabase
    .from('properties')
    .select('*')
  
  if (backupError) {
    console.error('Error creating backup:', backupError)
    return
  }

  // Save backup
  const backupPath = path.join(process.cwd(), 'backups', `properties_${Date.now()}.json`)
  fs.mkdirSync(path.dirname(backupPath), { recursive: true })
  fs.writeFileSync(backupPath, JSON.stringify(existingData, null, 2))
  console.log(`Backup saved to ${backupPath}`)

  try {
    // Read and validate data
    console.log('Reading and validating data...')
    const rawData = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), 'src/data/cleaned-properties.json'),
        'utf-8'
      )
    ).map((property: any) => {
      // Remove timestamp field
      const { timestamp, ...rest } = property
      return rest
    })

    // Validate each property with proper types
    const validationResults: ValidationResult[] = rawData.map((property: unknown) => {
      try {
        return {
          success: true,
          data: PropertySchema.parse(property)
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            error,
            data: property as Record<string, any>
          }
        }
        throw error
      }
    })

    const validProperties = validationResults
      .filter((r): r is ValidationSuccess => r.success)
      .map(r => r.data)

    const invalidProperties = validationResults
      .filter((r): r is ValidationError => !r.success)

    // Log validation results
    console.log(`Validation complete:`)
    console.log(`- Valid properties: ${validProperties.length}`)
    console.log(`- Invalid properties: ${invalidProperties.length}`)

    if (invalidProperties.length > 0) {
      console.log('\nInvalid properties:')
      invalidProperties.forEach(({ error, data }) => {
        console.log(`- Property "${data.property_name}":`, error.errors)
      })
      
      // Save invalid properties to file
      const invalidPath = path.join(process.cwd(), 'logs', `invalid_properties_${Date.now()}.json`)
      fs.mkdirSync(path.dirname(invalidPath), { recursive: true })
      fs.writeFileSync(invalidPath, JSON.stringify(
        invalidProperties.map(({ error, data }) => ({
          property: data,
          errors: error.errors
        })),
        null, 
        2
      ))
      console.log(`\nInvalid properties saved to ${invalidPath}`)
    }

    // Clear existing data
    console.log('\nClearing existing data...')
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .gt('created_at', '2000-01-01')
    
    if (deleteError) {
      throw new Error(`Error clearing data: ${deleteError.message}`)
    }

    // Transform and insert valid data
    const transformedData = validProperties.map(property => ({
      id: crypto.randomUUID(),
      property_name: property.property_name,
      property_type: property.property_type,
      district: property.district,
      rental_price: property.price,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      mrt: property.mrt,
      latitude: 0,
      longitude: 0,
      completion_year: property.completion_year,
      url: property.url,
      created_at: new Date().toISOString()
    }))

    // Insert in batches with progress tracking
    const batchSize = 100
    const totalBatches = Math.ceil(transformedData.length / batchSize)
    console.log(`\nImporting ${transformedData.length} properties in ${totalBatches} batches...`)
    
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      
      try {
        const { error: insertError } = await supabase
          .from('properties')
          .insert(batch)
        
        if (insertError) {
          throw new Error(`Error inserting batch ${batchNumber}: ${insertError.message}`)
        }
        
        console.log(`✓ Batch ${batchNumber}/${totalBatches} (${batch.length} properties)`)
      } catch (error) {
        console.error(`\nError in batch ${batchNumber}:`, error)
        
        // Attempt rollback using backup
        console.log('\nAttempting rollback...')
        await supabase.from('properties').delete().gt('created_at', '2000-01-01')
        const { error: rollbackError } = await supabase
          .from('properties')
          .insert(existingData)
        
        if (rollbackError) {
          console.error('Rollback failed:', rollbackError)
          console.log('Backup data is preserved in:', backupPath)
        } else {
          console.log('Rollback successful')
        }
        
        return
      }
    }

    console.log('\nImport complete!')
    console.log(`Successfully imported ${transformedData.length} properties`)
    
  } catch (error) {
    console.error('\nUnexpected error:', error)
    console.log('Backup data is preserved in:', backupPath)
  }
}

importData().catch(console.error) 