export class TypenxApiError extends Error {
  readonly status: number
  readonly payload: unknown

  constructor(status: number, message: string, payload: unknown) {
    super(message)
    this.name = 'TypenxApiError'
    this.status = status
    this.payload = payload
  }
}

export function isTypenxApiError(error: unknown): error is TypenxApiError {
  return error instanceof TypenxApiError
}
