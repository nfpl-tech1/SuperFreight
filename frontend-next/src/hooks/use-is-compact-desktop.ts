import { useMediaQuery } from "@/hooks/use-media-query";

const COMPACT_DESKTOP_QUERY = "(min-width: 768px) and (max-width: 1279px)";

export function useIsCompactDesktop() {
  return useMediaQuery(COMPACT_DESKTOP_QUERY);
}
