import { useEffect, useRef } from "react";

/** Calls `handler` when a click happens outside the returned ref or Escape is pressed. */
export function useDismiss<T extends HTMLElement>(
  active: boolean,
  handler: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, handler]);

  return ref;
}
