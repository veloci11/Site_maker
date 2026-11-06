export class ApiError extends Error {
  status: number
  code?: string
  fields?: Record<string, string>
  data?: unknown
  constructor(message: string, status: number, code?: string, fields?: Record<string, string>, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
    this.data = data
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown; timeoutMs?: number }
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, signal, timeoutMs, ...rest } = options
  if (timeoutMs !== undefined && (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2_147_483_647)) {
    throw new RangeError('Le délai de la requête doit être un nombre positif de millisecondes.')
  }
  if (signal?.aborted) throw signal.reason ?? new DOMException('Aborted', 'AbortError')
  const multipart = body instanceof FormData
  // Headers accepts all RequestInit forms and treats names case-insensitively.
  // Leave multipart Content-Type to fetch, which supplies the boundary.
  const requestHeaders = new Headers(headers)
  if (!requestHeaders.has('Accept')) requestHeaders.set('Accept', 'application/json')
  if (body !== undefined && !multipart && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }
  const controller = timeoutMs !== undefined || signal ? new AbortController() : null
  let timer: ReturnType<typeof setTimeout> | undefined
  let abortFromCaller: (() => void) | undefined
  const interrupted = controller ? new Promise<never>((_resolve, reject) => {
    const interrupt = (error: unknown) => {
      reject(error)
      controller.abort(error)
    }
    if (signal) {
      abortFromCaller = () => interrupt(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      signal.addEventListener('abort', abortFromCaller, { once: true })
    }
    if (timeoutMs !== undefined) {
      timer = setTimeout(() => interrupt(new ApiError(
        'Le serveur n’a pas confirmé la demande à temps. Elle peut déjà être enregistrée. Réessayez avec les mêmes informations pour retrouver sa confirmation.',
        0,
        'REQUEST_TIMEOUT',
      )), timeoutMs)
    }
  }) : null

  async function request(): Promise<T> {
    let response: Response
    try {
      response = await fetch(path, {
        ...rest,
        signal: controller?.signal ?? signal,
        credentials: 'same-origin',
        headers: requestHeaders,
        body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
      })
    } catch (error) {
      if (controller?.signal.aborted) throw controller.signal.reason
      if (error instanceof DOMException && error.name === 'AbortError') throw error
      throw new ApiError('La connexion n’a pas abouti. Réessayez dans un instant.', 0)
    }
    let data = null
    if (response.status !== 204) {
      try {
        data = await response.json()
      } catch (error) {
        if (controller?.signal.aborted) throw controller.signal.reason
        if (error instanceof DOMException && error.name === 'AbortError') throw error
        if (response.ok) throw new ApiError('La réponse du serveur n’a pas pu être lue. Réessayez dans un instant.', response.status, 'INVALID_RESPONSE')
      }
    }
    if (!response.ok) {
      throw new ApiError(
        data?.error || 'La demande n’a pas abouti. Réessayez.',
        response.status,
        data?.code,
        data?.fields,
        data,
      )
    }
    return data as T
  }

  try {
    // One deadline covers both headers and JSON. The race also releases callers
    // if a transport or body reader fails to settle after cancellation.
    return await (interrupted ? Promise.race([request(), interrupted]) : request())
  } finally {
    if (timer !== undefined) clearTimeout(timer)
    if (signal && abortFromCaller) signal.removeEventListener('abort', abortFromCaller)
  }
}

export function errorMessage(error: unknown, fallback = 'Une erreur est survenue. Réessayez.') {
  return error instanceof Error ? error.message : fallback
}

export function safeReturnPath(value: string | null | undefined, fallback = '/espace') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return fallback
  try {
    const url = new URL(value, 'https://studio.local')
    return url.origin === 'https://studio.local' ? `${url.pathname}${url.search}${url.hash}` : fallback
  } catch {
    return fallback
  }
}
