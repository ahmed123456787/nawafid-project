import { useCallback, useEffect, useRef, useState } from 'react'
import { apiMessage } from '../lib/apiError'

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Collapses the `data + loading + error + try/catch` pattern that every
 * list and detail page was repeating.
 *
 * Pass a `fetcher` and a dependency array (same semantics as useEffect).
 * The fetcher identity does not need to be stable — it is read from a
 * ref so you don't have to wrap it in useCallback at the call site.
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetcherRef.current()
      setData(res)
    } catch (err) {
      setError(apiMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refetch }
}
