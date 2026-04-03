import { useState, useEffect, useRef } from 'react'

export function useSearch(debounceMs = 300) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setDebounced(query), debounceMs)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [query, debounceMs])

  return { query, setQuery, debounced }
}
