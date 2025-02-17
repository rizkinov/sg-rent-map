import { NextResponse } from 'next/server'
import type { Property } from '@/types/property'
import { supabase } from '@/lib/supabase/server'
import { Database } from '@/types/database'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No data returned' },
        { status: 404 }
      )
    }

    return NextResponse.json(data as Property[])
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 