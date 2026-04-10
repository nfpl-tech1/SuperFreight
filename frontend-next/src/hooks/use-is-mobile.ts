import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

function getSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  const handleChange = () => onStoreChange();

  mediaQuery.addEventListener("change", handleChange);
  return () => mediaQuery.removeEventListener("change", handleChange);
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
