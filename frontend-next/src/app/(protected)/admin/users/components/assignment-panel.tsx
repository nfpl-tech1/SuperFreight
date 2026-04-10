import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AssignmentOption = {
  key: string;
  label: string;
  active: boolean;
};

export function AssignmentPanel({
  title,
  icon,
  selectedLabels,
  emptyLabel,
  options,
  onToggle,
}: {
  title: string;
  icon: ReactNode;
  selectedLabels: string[];
  emptyLabel: string;
  options: AssignmentOption[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        {icon}
        {title}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {selectedLabels.length > 0 ? (
          selectedLabels.map((item) => (
            <Badge key={item} variant="secondary" className="rounded-full px-3 py-1">
              {item}
            </Badge>
          ))
        ) : (
          <Badge variant="outline" className="rounded-full px-3 py-1 text-slate-500">
            {emptyLabel}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onToggle(option.key)}
            className={cn(
              "rounded-xl border px-3 py-2 text-sm font-medium transition-all",
              option.active
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
