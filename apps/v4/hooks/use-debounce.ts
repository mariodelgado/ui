import * as React from "react"

/**
 * Debounces a value by delaying updates until after a specified delay period.
 *
 * Useful for reducing the frequency of expensive operations like API calls,
 * search queries, or complex calculations that would otherwise run on every
 * keystroke or state change.
 *
 * @template T - The type of value being debounced
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds before the value updates
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [search, setSearch] = React.useState("")
 *   const debouncedSearch = useDebounce(search, 500)
 *
 *   React.useEffect(() => {
 *     if (debouncedSearch) {
 *       // This only runs 500ms after the user stops typing
 *       fetchResults(debouncedSearch)
 *     }
 *   }, [debouncedSearch])
 *
 *   return (
 *     <input
 *       value={search}
 *       onChange={(e) => setSearch(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Debounce with different types
 * const debouncedString = useDebounce("hello", 1000)
 * const debouncedNumber = useDebounce(42, 500)
 * const debouncedObject = useDebounce({ name: "John" }, 750)
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    // Set up the timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timeout if value changes before delay expires
    // or if component unmounts
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * A more advanced debounce hook that provides additional control over the debouncing behavior.
 *
 * Returns both the debounced value and utility functions to manually trigger or cancel
 * the pending update.
 *
 * @template T - The type of value being debounced
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds before the value updates
 * @returns An object containing the debounced value and control functions
 *
 * @example
 * ```tsx
 * function AdvancedSearch() {
 *   const [search, setSearch] = React.useState("")
 *   const {
 *     debouncedValue,
 *     isPending,
 *     flush,
 *     cancel
 *   } = useAdvancedDebounce(search, 500)
 *
 *   return (
 *     <div>
 *       <input
 *         value={search}
 *         onChange={(e) => setSearch(e.target.value)}
 *       />
 *       <button onClick={flush}>Search Now</button>
 *       <button onClick={cancel}>Cancel</button>
 *       {isPending && <span>Updating...</span>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAdvancedDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)
  const [isPending, setIsPending] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const cancel = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      setIsPending(false)
    }
  }, [])

  const flush = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      setDebouncedValue(value)
      setIsPending(false)
    }
  }, [value])

  React.useEffect(() => {
    setIsPending(true)

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
      setIsPending(false)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return {
    debouncedValue,
    isPending,
    flush,
    cancel,
  }
}

/**
 * Debounces a callback function instead of a value.
 *
 * Useful when you want to debounce an event handler or function call
 * rather than a state value.
 *
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds before the function executes
 * @returns The debounced callback function
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const handleSearch = useDebouncedCallback((searchTerm: string) => {
 *     console.log("Searching for:", searchTerm)
 *     // Perform API call
 *   }, 500)
 *
 *   return (
 *     <input
 *       onChange={(e) => handleSearch(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   )
 * }
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = React.useRef<NodeJS.Timeout>()
  const callbackRef = React.useRef(callback)

  // Update callback ref on each render
  React.useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )
}
