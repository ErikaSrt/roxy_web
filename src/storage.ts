import { useEffect, useState } from 'react'

export function createId(prefix = 'ROX') {
  if ('crypto' in window && 'randomUUID' in window.crypto) {
    return `${prefix}-${window.crypto.randomUUID().slice(0, 8).toUpperCase()}`
  }

  return `${prefix}-${Math.random().toString(16).slice(2, 10).toUpperCase()}`
}

export function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = window.localStorage.getItem(key)
    if (!stored) return fallback

    try {
      return JSON.parse(stored) as T
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
