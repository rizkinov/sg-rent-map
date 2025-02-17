export type ApiResponse<T> = {
  data?: T
  error?: string
  status?: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)
  
  if (error instanceof ApiError) {
    return {
      error: error.message,
      status: error.status,
      code: error.code
    }
  }

  return {
    error: 'Internal server error',
    status: 500
  }
} 