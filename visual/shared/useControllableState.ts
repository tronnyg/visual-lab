import {useCallback, useState} from "react";

/**
 * Controlled/uncontrolled state in one hook. A defined `value` is authoritative; otherwise the hook keeps its own state.
 * `onChange` runs only from the returned setter (a user action), never on mount or when `value` changes from outside.
 */
export function useControllableState<T>({value, defaultValue, onChange}: {value: T | undefined; defaultValue: T; onChange?: (next: T) => void}): [T, (next: T) => void] {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const set = useCallback((next: T) => {
    if (!controlled) setInner(next);
    onChange?.(next);
  }, [controlled, onChange]);
  return [controlled ? value : inner, set];
}
