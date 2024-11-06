import { useMemo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import { useStore } from "../lib/store";
import { CardItem } from "./CardItem";
import { cardMatchesFilters, filtersActive } from "../lib/filter";
import { cn } from "../lib/utils";

interface Props {
  columnId: string;
  overlay?: boolean;
}

export function Column({ columnId, overlay }: Props) {
  const column = useStore((s) => s.columns[columnId]);
  const cards = useStore((s) => s.cards);
  const filters = useStore((s) => s.filters);
  const renameColumn = useStore((s) => s.renameColumn);
  const deleteColumn = useStore((s) => s.deleteColumn);
  const addCard = useStore((s) => s.addCard);

  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: columnId,
    data: { type: "Column" },
    disabled: overlay,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const visibleCards = useMemo(() => {
    if (!column) return [];
    const list = column.cardIds.map((id) => cards[id]).filter(Boolean);
    return filtersActive(filters)
      ? list.filter((c) => cardMatchesFilters(c, filters))
      : list;
  }, [column, cards, filters]);

  if (!column) return null;

  const total = column.cardIds.length;
  const hiddenByFilter = total - visibleCards.length;

  const commitTitle = () => {
    if (title.trim()) renameColumn(columnId, title.trim());
    setEditingTitle(false);
  };

  const commitCard = () => {
    if (draft.trim()) addCard(columnId, draft.trim());
    setDraft("");
    // keep composer open for rapid entry
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex max-h-full w-72 shrink-0 flex-col rounded-2xl bg-slate-200/60 dark:bg-slate-900/70",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-center gap-1 px-3 pb-1 pt-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 text-slate-400 hover:bg-slate-300/60 active:cursor-grabbing dark:hover:bg-slate-700/60"
          aria-label="Drag column"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {editingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") setEditingTitle(false);
            }}
            className="min-w-0 flex-1 rounded-md border border-indigo-300 bg-white px-2 py-0.5 text-sm font-semibold outline-none dark:border-indigo-500/50 dark:bg-slate-800"
          />
        ) : (
          <button
            onClick={() => {
              setTitle(column.title);
              setEditingTitle(true);
            }}
            className="min-w-0 flex-1 truncate rounded-md px-1 py-0.5 text-left text-sm font-semibold hover:bg-slate-300/50 dark:hover:bg-slate-700/50"
          >
            {column.title}
          </button>
        )}

        <span className="rounded-full bg-slate-300/70 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700/70 dark:text-slate-300">
          {total}
        </span>
        <button
          onClick={() => {
            if (
              column.cardIds.length === 0 ||
              confirm(`Delete list "${column.title}" and its cards?`)
            )
              deleteColumn(columnId);
          }}
          className="rounded p-1 text-slate-400 transition hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/20"
          aria-label="Delete list"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-col gap-2 overflow-y-auto px-2 py-2">
        <SortableContext
          items={visibleCards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {visibleCards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </SortableContext>

        {visibleCards.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-slate-400">
            {hiddenByFilter > 0
              ? `${hiddenByFilter} card${hiddenByFilter > 1 ? "s" : ""} hidden by filters`
              : "No cards yet"}
          </p>
        )}

        {composing && (
          <div className="rounded-xl bg-white p-2 shadow-sm dark:bg-slate-800">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  commitCard();
                }
                if (e.key === "Escape") {
                  setComposing(false);
                  setDraft("");
                }
              }}
              placeholder="Enter a title…"
              rows={2}
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={commitCard}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Add card
              </button>
              <button
                onClick={() => {
                  setComposing(false);
                  setDraft("");
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {!composing && (
        <button
          onClick={() => setComposing(true)}
          className="m-2 mt-0 flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-300/50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
        >
          <Plus className="h-4 w-4" />
          Add a card
        </button>
      )}
    </div>
  );
}
