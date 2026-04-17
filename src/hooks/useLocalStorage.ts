import { useState, useEffect, useCallback } from 'react'

/**
 * Drop-in useState replacement that persists to localStorage.
 * Works cross-platform (any browser on Mac, Windows, Linux).
 * JSON serialises the value automatically.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const readValue = (): T => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : initialValue
    } catch {
      return initialValue
    }
  }

  const [stored, setStored] = useState<T>(readValue)

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const next = value instanceof Function ? value(stored) : value
        window.localStorage.setItem(key, JSON.stringify(next))
        setStored(next)
      } catch (e) {
        console.warn(`useLocalStorage: could not write key "${key}"`, e)
      }
    },
    [key, stored],
  )

  // Sync across tabs / windows
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try { setStored(JSON.parse(e.newValue) as T) } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key])

  return [stored, setValue]
}
