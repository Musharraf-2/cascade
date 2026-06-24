import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlignLeft, CalendarClock, CheckSquare } from "lucide-react";
import { useStore } from "../lib/store";
import { cn, formatDue, getDueStatus, DUE_STATUS_CHIP } from "../lib/utils";
import { labelSoft, labelSolid, PRIORITY_META } from "../lib/theme";
import type { Card } from "../lib/types";

interface Props {
  card: Card;
  overlay?: boolean;
}

export function CardItem({ card, overlay }: Props) {
  const board = useStore((s) =>
    s.activeBoardId ? s.boards[s.activeBoardId] : null
  );
  const setOpenCard = useStore((s) => s.setOpenCard);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "Card" },
    disabled: overlay,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const labels = (board?.labels ?? []).filter((l) =>
    card.labelIds.includes(l.id)
  );
  const dueStatus = getDueStatus(card.dueDate);
  const doneCount = card.checklist.filter((c) => c.done).length;
  const hasChecklist = card.checklist.length > 0;
  const allDone = hasChecklist && doneCount === card.checklist.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !overlay && setOpenCard(card.id)}
      className={cn(
        "group cursor-pointer touch-none overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:ring-indigo-300 dark:bg-slate-800 dark:ring-white/5 dark:hover:ring-indigo-500/50",
        isDragging && "opacity-40",
        overlay && "shadow-xl ring-indigo-300 dark:ring-indigo-500/50"
      )}
    >
      {labels.length > 0 && (
        <div className="flex gap-1 px-3 pt-3">
          {labels.map((l) => (
            <span
              key={l.id}
              className={cn("h-1.5 w-8 rounded-full", labelSolid[l.color])}
              title={l.name}
            />
          ))}
        </div>
      )}

      <div className="p-3">
        <p className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-100">
          {card.title}
        </p>

        {labels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {labels.map((l) => (
              <span
                key={l.id}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  labelSoft[l.color]
                )}
              >
                {l.name}
              </span>
            ))}
          </div>
        )}

        {(card.priority ||
          card.dueDate ||
          hasChecklist ||
          card.description) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {card.priority && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-md px-1.5 py-0.5",
                  PRIORITY_META[card.priority].chip
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    PRIORITY_META[card.priority].dot
                  )}
                />
                {PRIORITY_META[card.priority].label}
              </span>
            )}

            {card.dueDate && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-md px-1.5 py-0.5",
                  DUE_STATUS_CHIP[dueStatus]
                )}
              >
                <CalendarClock className="h-3 w-3" />
                {formatDue(card.dueDate)}
              </span>
            )}

            {hasChecklist && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-md px-1.5 py-0.5",
                  allDone
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                    : "bg-slate-100 dark:bg-slate-700/60"
                )}
              >
                <CheckSquare className="h-3 w-3" />
                {doneCount}/{card.checklist.length}
              </span>
            )}

            {card.description && (
              <span className="flex items-center" title="Has description">
                <AlignLeft className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
