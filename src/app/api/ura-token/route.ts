import { NextResponse } from 'next/server'
import { generateURAToken } from '@/lib/utils/ura-token'

export async function GET() {
  try {
    const token = await generateURAToken()
    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}