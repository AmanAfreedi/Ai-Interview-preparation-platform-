const DEFAULT_API_URL = 'http://localhost:8000'

export function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL?.trim()
  return url || DEFAULT_API_URL
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  idToken?: string | null
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, idToken } = options
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const data = (await response.json()) as { detail?: string | { msg?: string }[] }
      if (typeof data.detail === 'string') {
        message = data.detail
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        message = data.detail.map((d) => d.msg).join(', ')
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status)
  }

  return response.json() as Promise<T>
}
