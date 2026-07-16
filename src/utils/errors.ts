/**
 * Custom application error with HTTP-like status codes
 * Use this for consistent error handling across server actions
 */
export class AppError extends Error {
    public readonly statusCode: number
    public readonly code: string
    public readonly isOperational: boolean

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        isOperational: boolean = true
    ) {
        super(message)
        this.statusCode = statusCode
        this.code = code
        this.isOperational = isOperational
        Object.setPrototypeOf(this, AppError.prototype)
    }

    static unauthorized(message = 'Unauthorized'): AppError {
        return new AppError(message, 401, 'UNAUTHORIZED')
    }

    static forbidden(message = 'Permission denied'): AppError {
        return new AppError(message, 403, 'FORBIDDEN')
    }

    static notFound(resource = 'Resource'): AppError {
        return new AppError(`${resource} not found`, 404, 'NOT_FOUND')
    }

    static badRequest(message = 'Invalid request'): AppError {
        return new AppError(message, 400, 'BAD_REQUEST')
    }

    static validation(message: string): AppError {
        return new AppError(message, 400, 'VALIDATION_ERROR')
    }

    static duplicate(resource = 'Resource'): AppError {
        return new AppError(`${resource} already exists`, 409, 'DUPLICATE')
    }

    static internalError(message = 'An unexpected error occurred'): AppError {
        return new AppError(message, 500, 'INTERNAL_ERROR', false)
    }
}

/**
 * Standard API response type
 */
export type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string }

/**
 * Wrap a server action function with consistent error handling
 * 
 * @example
 * ```typescript
 * export const myAction = withErrorHandling(async (input: SomeInput) => {
 *     const { supabase } = await getAuthContext()
 *     // ... do work
 *     return { result: 'success' }
 * })
 * ```
 */
export function withErrorHandling<TInput, TOutput>(
    fn: (input: TInput) => Promise<TOutput>
): (input: TInput) => Promise<ActionResult<TOutput>> {
    return async (input: TInput): Promise<ActionResult<TOutput>> => {
        try {
            const data = await fn(input)
            return { success: true, data }
        } catch (error) {
            if (error instanceof AppError) {
                return {
                    success: false,
                    error: error.message,
                    code: error.code
                }
            }

            // Handle Zod validation errors
            if (error && typeof error === 'object' && 'issues' in error) {
                const zodError = error as { issues: Array<{ message: string; path: (string | number)[] }> }
                const firstIssue = zodError.issues[0]
                const fieldPath = firstIssue.path.join('.')
                const message = fieldPath ? `${fieldPath}: ${firstIssue.message}` : firstIssue.message
                return {
                    success: false,
                    error: message,
                    code: 'VALIDATION_ERROR'
                }
            }

            // Log unexpected errors
            console.error('Unexpected error:', error)

            // Don't expose internal error details in production
            const message = process.env.NODE_ENV === 'development' && error instanceof Error
                ? error.message
                : 'An unexpected error occurred'

            return { success: false, error: message }
        }
    }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError
}

/**
 * Handle Supabase errors and convert to AppError
 */
export function handleSupabaseError(error: { code: string; message: string }): never {
    switch (error.code) {
        case 'PGRST116':
            throw AppError.notFound()
        case '23505':
            throw AppError.duplicate()
        case '42501':
            throw AppError.forbidden('Insufficient permissions')
        case '42P17':
            console.error('RLS recursion error:', error)
            throw AppError.internalError('Access policy error. Please contact support.')
        default:
            console.error('Supabase error:', error)
            throw AppError.internalError('Database operation failed')
    }
}

/**
 * Validate input using a Zod schema and throw AppError on failure
 */
import type { z } from 'zod'

export function validateInput<T extends z.ZodType>(
    schema: T,
    data: unknown
): z.infer<T> {
    const result = schema.safeParse(data)
    if (!result.success) {
        const firstIssue = result.error.issues[0]
        const fieldPath = firstIssue.path.join('.')
        const message = fieldPath
            ? `${fieldPath}: ${firstIssue.message}`
            : firstIssue.message
        throw AppError.validation(message)
    }
    return result.data
}

/**
 * Sanitize a string for safe database storage
 */
export function sanitizeString(input: string, maxLength = 500): string {
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>]/g, '') // Basic XSS prevention
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
}

/**
 * Validate UUID and throw if invalid
 */
export function validateUUID(id: string, fieldName = 'ID'): string {
    if (!isValidUUID(id)) {
        throw AppError.badRequest(`Invalid ${fieldName} format`)
    }
    return id
}

