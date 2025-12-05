import { ApiError } from '@/client'
import { type ToastOptions } from '@/hooks/public/useToaster'

interface ApiErrorBody {
  detail?: string | Array<{ loc?: string[]; msg?: string }>
  [key: string]: unknown
}

// Type Guard
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'body' in error &&
    typeof (error as ApiError).body === 'object'
  )
}

// Core Message Extractor
export const getApiErrorMessage = (error: unknown): string => {
  if (!error) return 'An error occurred.'

  // Pydantic-style validation errors (422)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractValidationDetail = (body: any) => {
    if (Array.isArray(body?.detail)) {
      return body.detail
        .map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (e: any) =>
            `${e.loc?.join('.') || 'field'}: ${e.msg || 'invalid value'}`
        )
        .join(', ')
    }
    return undefined
  }

  // 2️⃣ ApiError (from generated client)
  if (isApiError(error)) {
    const body = error.body as ApiErrorBody
    const validationMessage = extractValidationDetail(body)
    if (validationMessage) return validationMessage
    if (typeof body.detail === 'string') return body.detail
    return error.message || 'An unexpected API error occurred.'
  }

  // 3️⃣ Axios / fetch-style errors
  if (typeof error === 'object' && error !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any

    const validationMessage = extractValidationDetail(err.body || err.response?.data)
    if (validationMessage) return validationMessage

    if (typeof err.body?.detail === 'string') return err.body.detail
    if (typeof err.response?.data?.detail === 'string') return err.response.data.detail
    if (err.message && typeof err.message === 'string') return err.message
  }

  // 4️⃣ Raw string or unknown error
  if (typeof error === 'string') return error

  return 'An unexpected error occurred.'
}

//- Toast Helper-
export function handleApiError(
  error: unknown,
  toast: (options: ToastOptions) => void
) {
  toast({
    id: 'api-error',
    title: 'Request failed',
    description: getApiErrorMessage(error),
    status: 'error',
  })
}
