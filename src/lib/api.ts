export class ApiError extends Error {
  status: number
  code?: string
  fields?: Record<string, string>
  data?: unknown
  constructor(message: string, status: number, code?: string, fields?: Record<string, string>, data?: unknown) {
    super(message); this.name = 'ApiError'; this.status = status; this.code = code; this.fields = fields; this.data = data
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown }
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const multipart = body instanceof FormData
  let response: Response
  try {
    response = await fetch(path, {
      ...rest, credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(body !== undefined && !multipart ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError('La connexion n’a pas abouti. Réessayez dans un instant.', 0)
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(data?.error || 'La demande n’a pas abouti. Réessayez.', response.status, data?.code, data?.fields, data)
  return data as T
}

export function errorMessage(error: unknown, fallback = 'Une erreur est survenue. Réessayez.') {
  return error instanceof Error ? error.message : fallback
}

export function safeReturnPath(value: string | null | undefined, fallback = '/espace') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return fallback
  try { const url = new URL(value, 'https://studio.local'); return url.origin === 'https://studio.local' ? `${url.pathname}${url.search}${url.hash}` : fallback } catch { return fallback }
}
