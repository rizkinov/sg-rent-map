import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const { data, error } = await supabase.from('properties').select('*')
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to connect to database' },
      { status: 500 }
    )
  }
} 