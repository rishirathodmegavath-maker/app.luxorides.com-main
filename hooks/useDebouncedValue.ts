import { useEffect, useState } from "react";

// Delays reflecting a fast-changing value (e.g. a search input) until it has
// stopped changing for `delayMs`, so a consumer effect keyed on the returned
// value only re-runs once per pause instead of once per keystroke. Callers
// keep whatever "stale response" protection they already have (e.g. an
// effect's own `cancelled` cleanup flag) -- this only reduces how often the
// effect re-fires, it doesn't add response ordering guarantees of its own.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
