/**
 * Extract the backend's top-level error message from a thrown axios error.
 * Falls back to the provided string if the shape is anything else.
 */
export function apiMessage(err: unknown, fallback = 'Request failed.'): string {
  return (err as any)?.response?.data?.message ?? fallback
}

/**
 * Extract the backend's field-level validation errors from a thrown axios error.
 * Returns an empty object if the shape is anything else.
 */
export function apiErrors(err: unknown): Record<string, string[]> {
  return (err as any)?.response?.data?.errors ?? {}
}
