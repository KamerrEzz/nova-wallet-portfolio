import { useCallback, useEffect, useRef, useState } from 'react'

export type SetLocalStorageValue<T> = T | ((previous: T) => T)

/**
 * useState persisted to localStorage (JSON-serialized, lazy init).
 * Syncs across tabs via the `storage` event.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (value: SetLocalStorageValue<T>) => void] {
  const initialRef = useRef(initial)

  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw != null ? (JSON.parse(raw) as T) : initialRef.current
    } catch {
      return initialRef.current
    }
  })

  const set = useCallback(
    (next: SetLocalStorageValue<T>) => {
      setValue((previous) => {
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(previous) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* storage unavailable or full — keep in-memory value */
        }
        return resolved
      })
    },
    [key],
  )

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return
      try {
        setValue(event.newValue != null ? (JSON.parse(event.newValue) as T) : initialRef.current)
      } catch {
        /* ignore malformed payloads */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [value, set]
}
