import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateURAToken } from '@/lib/utils/ura-token'
import { fetchRentalData } from '@/lib/utils/ura-api'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // fetchRentalData() is currently a stub that returns sample data.
    // Running this cron would wipe the real dataset and replace it with the stub,
    // so it stays disabled until the live URA fetch is implemented and this flag is set.
    // Data refreshes are done offline via src/scripts/fetch-ura-2026.ts instead.
    if (process.env.ENABLE_URA_CRON !== 'true') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cron refresh is disabled: live URA fetch is not implemented. Use src/scripts/fetch-ura-2026.ts for offline refreshes.',
        },
        { status: 503 }
      )
    }

    // Fetch new data
    const properties = await fetchRentalData()  // Removed token parameter
    console.log('Fetched properties count:', properties.length)

    // Refuse to wipe the dataset for an implausibly small fetch result
    const MIN_EXPECTED_PROPERTIES = 100
    if (!properties || properties.length < MIN_EXPECTED_PROPERTIES) {
      throw new Error(
        `Refusing to replace dataset: URA API returned ${properties?.length ?? 0} properties (expected at least ${MIN_EXPECTED_PROPERTIES})`
      )
    }

    // Use server client instead
    const supabaseServer = createServerClient()
    
    try {
      // Clear existing data
      const { error: deleteError } = await supabaseServer
        .from('properties')
        .delete()
        .gte('created_at', '2000-01-01')
      
      if (deleteError) {
        console.error('Error deleting existing data:', deleteError)
        throw deleteError
      }

      console.log('Successfully deleted existing data')
      
      // Insert new data with generated UUIDs
      const propertiesWithIds = properties.map(property => ({
        ...property,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      }))

      // Modified insert query without count
      const { error: insertError, data } = await supabaseServer
        .from('properties')
        .insert(propertiesWithIds)
        .select()

      if (insertError) {
        console.error('Error inserting new data:', insertError)
        throw insertError
      }

      console.log('Successfully inserted new data:', data?.length)

      return NextResponse.json({ 
        success: true,
        message: `Updated ${properties.length} properties`,
        count: data?.length
      })
    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      throw dbError
    }
  } catch (error: any) {
    console.error('Failed to refresh data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to refresh data',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
} 