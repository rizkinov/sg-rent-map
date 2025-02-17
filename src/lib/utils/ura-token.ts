import type { Database } from '@/types/database'

interface URAResponse {
  Result: string
  Status: string
  Message: string
}

const URA_TOKEN_URL = 'https://www.ura.gov.sg/uraDataService/insertNewToken.action'

export async function generateURAToken(): Promise<string> {
  try {
    const response = await fetch(URA_TOKEN_URL, {
      headers: {
        'AccessKey': process.env.URA_ACCESS_KEY!,
      },
    })

    const data: URAResponse = await response.json()

    if (data.Status !== 'Success') {
      throw new Error(data.Message || 'Failed to generate URA token')
    }

    return data.Result
  } catch (error) {
    console.error('Error generating URA token:', error)
    throw error
  }
}