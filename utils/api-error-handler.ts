/**
 * API Error Handler Utility
 * Provides consistent error handling and user-friendly error messages
 */

export interface ApiError {
  message: string
  code?: string
  details?: any
}

/**
 * Extracts a user-friendly message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Handle Supabase-specific errors
    if (error.message.includes('No school access')) {
      return 'You do not have access to this school. Please log in again.'
    }
    if (error.message.includes('JWT')) {
      return 'Your session has expired. Please log in again.'
    }
    if (error.message.includes('duplicate key')) {
      return 'This record already exists.'
    }
    if (error.message.includes('violates foreign key')) {
      return 'Cannot complete this action due to related records.'
    }
    if (error.message.includes('permission denied')) {
      return 'You do not have permission to perform this action.'
    }
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Parses API errors into a consistent format
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      message: getErrorMessage(error),
      details: error
    }
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as any
    return {
      message: err.message || getErrorMessage(error),
      code: err.code,
      details: err
    }
  }
  
  return {
    message: getErrorMessage(error)
  }
}

/**
 * Wraps an async operation with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options?: {
    fallbackValue?: T
    onError?: (error: ApiError) => void
  }
): Promise<T | undefined> {
  try {
    return await operation()
  } catch (error) {
    const apiError = parseApiError(error)
    options?.onError?.(apiError)
    return options?.fallbackValue
  }
}
