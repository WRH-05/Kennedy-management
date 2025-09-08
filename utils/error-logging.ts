// Error logging utilities for better debugging

export const logError = (context: string, error: any) => {
  console.group(`❌ Error in ${context}`)
  
  if (error) {
    console.error('Message:', error?.message || 'No message')
    console.error('Details:', error?.details || 'No details')
    console.error('Hint:', error?.hint || 'No hint')
    console.error('Code:', error?.code || 'No code')
    console.error('Name:', error?.name || 'No name')
    
    if (error?.stack) {
      console.error('Stack (truncated):', error.stack.substring(0, 500) + '...')
    }
    
    // Log the full error object structure
    console.error('Full error:', {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      name: error?.name,
      cause: error?.cause,
      // Include any other properties that might exist
      ...Object.keys(error).reduce((acc, key) => {
        if (!['message', 'details', 'hint', 'code', 'name', 'cause', 'stack'].includes(key)) {
          acc[key] = error[key]
        }
        return acc
      }, {})
    })
  } else {
    console.error('Error object is null/undefined')
  }
  
  console.groupEnd()
}

export const getErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error occurred'
  
  // Try different common error message properties
  return (
    error?.message ||
    error?.details ||
    error?.hint ||
    error?.error_description ||
    error?.description ||
    `Error: ${error?.code || 'Unknown code'}`
  )
}

export const createUserFriendlyError = (error: any, defaultMessage: string): Error => {
  const message = getErrorMessage(error) || defaultMessage
  const userError = new Error(message)
  
  // Preserve original error properties if needed
  if (error?.code) userError.name = `${error.code}`
  
  return userError
}
