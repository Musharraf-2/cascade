import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlignLeft,
  CalendarClock,
  Check,
  Flag,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useStore, nextLabelColor } from "../lib/store";
import { useDismiss } from "../hooks";
import { cn, formatRelative } from "../lib/utils";
import { labelSoft, labelSolid, PRIORITY_META } from "../lib/theme";
import type { Priority } from "../lib/types";

interface Props {
  cardId: string;
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function CardModal({ cardId }: Props) {
  const card = useStore((s) => s.cards[cardId]);
  const board = useStore((s) =>
    s.activeBoardId ? s.boards[s.activeBoardId] : null
  );
  const column = useStore((s) => (card ? s.columns[card.columnId] : null));
  const setOpenCard = useStore((s) => s.setOpenCard);
  const updateCard = useStore((s) => s.updateCard);
  const deleteCard = useStore((s) => s.deleteCard);
  const toggleCardLabel = useStore((s) => s.toggleCardLabel);
  const addLabel = useStore((s) => s.addLabel);
  const deleteLabel = useStore((s) => s.deleteLabel);
  const addChecklistItem = useStore((s) => s.addChecklistItem);
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem);
  const deleteChecklistItem = useStore((s) => s.deleteChecklistItem);

  const close = () => setOpenCard(null);
  const ref = useDismiss<HTMLDivElement>(true, close);

  const [titleDraft, setTitleDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    if (card) setTitleDraft(card.title);
  }, [cardId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!card) return null;

  const doneCount = card.checklist.filter((c) => c.done).length;
  const progress = card.checklist.length
    ? Math.round((doneCount / card.checklist.length) * 100)
    : 0;

  const commitTitle = () => {
    const v = titleDraft.trim();
    if (v && v !== card.title) updateCard(cardId, { title: v });
    else setTitleDraft(card.title);
  };

  const commitDesc = () => {
    updateCard(
      cardId,
      { description: descDraft },
      card.description !== descDraft ? "Updated description" : undefined
    );
    setEditingDesc(false);
  };

  const createLabel = () => {
    const v = newLabel.trim();
    if (!v || !board) return;
    addLabel(v, nextLabelColor(board.labels));
    setNewLabel("");
  };

  const addItem = () => {
    const v = newItem.trim();
    if (!v) return;
    addChecklistItem(cardId, v);
    setNewItem("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in sm:p-8">
      <div
        ref={ref}
        className="my-auto w-full max-w-3xl animate-scale-in rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="mt-1 text-slate-400">
            <AlignLeft className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLTextAreaElement).blur();
                }
              }}
              rows={1}
              className="w-full resize-none bg-transparent text-xl font-bold leading-tight outline-none"
            />
            <p className="mt-0.5 text-xs text-slate-400">
              in list <span className="font-medium">{column?.title}</span>
            </p>
          </div>
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 md:col-span-2">
            {/* Description */}
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <AlignLeft className="h-4 w-4" /> Description
              </h3>
              {editingDesc ? (
                <div>
                  <textarea
                    autoFocus
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    rows={6}
                    placeholder="Add a more detailed description… (Markdown supported)"
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={commitDesc}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingDesc(false)}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : card.description ? (
                <button
                  onClick={() => {
                    setDescDraft(card.description);
                    setEditingDesc(true);
                  }}
                  className="prose-cascade block w-full rounded-xl bg-slate-50 p-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {card.description}
                  </ReactMarkdown>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setDescDraft("");
                    setEditingDesc(true);
                  }}
                  className="w-full rounded-xl bg-slate-50 p-3 text-left text-sm text-slate-400 transition hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                >
                  Add a more detailed description…
                </button>
              )}
            </section>

            {/* Checklist */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Check className="h-4 w-4" /> Checklist
                </h3>
                {card.checklist.length > 0 && (
                  <span className="text-xs font-medium text-slate-400">
                    {doneCount}/{card.checklist.length}
                  </span>
                )}
              </div>

              {card.checklist.length > 0 && (
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="space-y-1">
                {card.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <button
                      onClick={() => toggleChecklistItem(cardId, item.id)}
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                        item.done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      )}
                    >
                      {item.done && <Check className="h-3 w-3" />}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        item.done &&
                          "text-slate-400 line-through dark:text-slate-500"
                      )}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => deleteChecklistItem(cardId, item.id)}
                      className="rounded p-1 text-slate-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
                      aria-label="Delete item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                  placeholder="Add an item…"
                  className="flex-1 rounded-lg border border-slate-200 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700"
                />
                <button
                  onClick={addItem}
                  className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                  aria-label="Add item"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </section>

            {/* Activity */}
            <section>
              <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Activity
              </h3>
              <ul className="space-y-1.5">
                {card.activity.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="flex-1">{a.text}</span>
                    <span className="text-slate-400">{formatRelative(a.at)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Labels */}
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Tag className="h-3.5 w-3.5" /> Labels
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {board?.labels.map((l) => {
                  const on = card.labelIds.includes(l.id);
                  return (
                    <span key={l.id} className="group/label relative">
                      <button
                        onClick={() => toggleCardLabel(cardId, l.id)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium transition",
                          labelSoft[l.color],
                          on
                            ? "ring-2 ring-indigo-500/60"
                            : "opacity-60 hover:opacity-100"
                        )}
                      >
                        {l.name}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete label "${l.name}" from board?`))
                            deleteLabel(l.id);
                        }}
                        className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-slate-600 text-white group-hover/label:flex"
                        aria-label="Delete label"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={cn(
                    "h-3 w-3 shrink-0 rounded-full",
                    board ? labelSolid[nextLabelColor(board.labels)] : ""
                  )}
                />
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createLabel()}
                  placeholder="New label…"
                  className="flex-1 rounded-lg border border-slate-200 bg-transparent px-2.5 py-1 text-sm outline-none focus:border-indigo-400 dark:border-slate-700"
                />
              </div>
            </section>

            {/* Due date */}
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <CalendarClock className="h-3.5 w-3.5" /> Due date
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={toDateInput(card.dueDate)}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateCard(
                      cardId,
                      {
                        dueDate: v
                          ? new Date(`${v}T12:00:00`).toISOString()
                          : null,
                      },
                      v ? "Set due date" : "Removed due date"
                    );
                  }}
                  className="flex-1 rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:[color-scheme:dark]"
                />
                {card.dueDate && (
                  <button
                    onClick={() =>
                      updateCard(
                        cardId,
                        { dueDate: null },
                        "Removed due date"
                      )
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Clear due date"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </section>

            {/* Priority */}
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Flag className="h-3.5 w-3.5" /> Priority
              </h3>
              <div className="flex gap-1.5">
                {(["low", "medium", "high"] as Priority[]).map((p) => {
                  const on = card.priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() =>
                        updateCard(
                          cardId,
                          { priority: on ? null : p },
                          on ? undefined : `Priority set to ${p}`
                        )
                      }
                      className={cn(
                        "flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition",
                        PRIORITY_META[p].chip,
                        on
                          ? "ring-2 ring-indigo-500/60"
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      {PRIORITY_META[p].label}
                    </button>
                  );
                })}
              </div>
            </section>

            <button
              onClick={() => {
                deleteCard(cardId);
                close();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-50 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
            >
              <Trash2 className="h-4 w-4" /> Delete card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
