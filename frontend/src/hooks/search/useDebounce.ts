// Debounce hook to delay updates
import { useState, useEffect } from "react";

/**
 * 
 * @param value  The value to debounce
 * @param delay Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {

    const handler = setTimeout(() => {
      setDebounced(value)
    }, delay)
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}