import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useStore } from "../lib/store";
import { useDismiss } from "../hooks";
import { cn } from "../lib/utils";
import { labelSoft, PRIORITY_META } from "../lib/theme";
import type { Filters, Priority } from "../lib/types";

const DUE_OPTIONS: { value: Filters["due"]; label: string }[] = [
  { value: "all", label: "Any" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
];

export function FilterMenu() {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));

  const board = useStore((s) =>
    s.activeBoardId ? s.boards[s.activeBoardId] : null
  );
  const filters = useStore((s) => s.filters);
  const setFilter = useStore((s) => s.setFilter);
  const toggleFilterLabel = useStore((s) => s.toggleFilterLabel);
  const clearFilters = useStore((s) => s.clearFilters);

  const activeCount =
    filters.labelIds.length +
    (filters.priority ? 1 : 0) +
    (filters.due !== "all" ? 1 : 0);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition",
          activeCount > 0
            ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-300"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60"
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">Filter</span>
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[11px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 origin-top-right animate-scale-in rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Labels
            </p>
            {board && board.labels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {board.labels.map((l) => {
                  const on = filters.labelIds.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => toggleFilterLabel(l.id)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium transition",
                        labelSoft[l.color],
                        on ? "ring-2 ring-indigo-500/60" : "opacity-70 hover:opacity-100"
                      )}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No labels yet.</p>
            )}
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Priority
            </p>
            <div className="flex gap-1.5">
              {(["low", "medium", "high"] as Priority[]).map((p) => {
                const on = filters.priority === p;
                return (
                  <button
                    key={p}
                    onClick={() => setFilter("priority", on ? null : p)}
                    className={cn(
                      "flex-1 rounded-lg px-2 py-1 text-xs font-medium transition",
                      PRIORITY_META[p].chip,
                      on ? "ring-2 ring-indigo-500/60" : "opacity-70 hover:opacity-100"
                    )}
                  >
                    {PRIORITY_META[p].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Due date
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {DUE_OPTIONS.map((o) => {
                const on = filters.due === o.value;
                return (
                  <button
                    key={o.value}
                    onClick={() => setFilter("due", o.value)}
                    className={cn(
                      "rounded-lg px-2 py-1 text-xs font-medium transition",
                      on
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-700"
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={clearFilters}
            disabled={activeCount === 0}
            className="w-full rounded-lg border border-slate-200 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/60"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
