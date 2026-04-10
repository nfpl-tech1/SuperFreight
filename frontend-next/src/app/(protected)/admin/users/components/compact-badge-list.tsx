import { Badge } from "@/components/ui/badge";
import { CLOSED_BADGE_LIMIT } from "../user-management.constants";

export function CompactBadgeList({
  items,
  emptyLabel,
}: {
  items: string[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <Badge variant="outline" className="shrink-0 rounded-full px-3 py-1 text-slate-500">
        {emptyLabel}
      </Badge>
    );
  }

  const visible = items.slice(0, CLOSED_BADGE_LIMIT);
  const remaining = items.length - visible.length;

  return (
    <>
      {visible.map((item) => (
        <Badge key={item} variant="secondary" className="shrink-0 rounded-full px-3 py-1">
          {item}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="shrink-0 rounded-full px-3 py-1 text-slate-500">
          +{remaining}
        </Badge>
      )}
    </>
  );
}
