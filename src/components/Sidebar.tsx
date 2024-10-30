import { useState } from "react";
import {
  Plus,
  Trello,
  Trash2,
  X,
  Check,
  Moon,
  Sun,
} from "lucide-react";
import { useStore } from "../lib/store";
import { cn } from "../lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: Props) {
  const boards = useStore((s) => s.boards);
  const boardOrder = useStore((s) => s.boardOrder);
  const activeBoardId = useStore((s) => s.activeBoardId);
  const setActiveBoard = useStore((s) => s.setActiveBoard);
  const addBoard = useStore((s) => s.addBoard);
  const deleteBoard = useStore((s) => s.deleteBoard);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const commitAdd = () => {
    const value = name.trim();
    if (value) addBoard(value);
    setName("");
    setAdding(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 md:static md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <Trello className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-extrabold tracking-tight">Cascade</p>
              <p className="text-[11px] text-slate-400">Flow your work</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-5 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Boards
          </span>
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
            aria-label="Add board"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-2">
          {boardOrder.map((id) => {
            const board = boards[id];
            if (!board) return null;
            const active = id === activeBoardId;
            const count = board.columnIds.length;
            return (
              <div
                key={id}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                <button
                  onClick={() => {
                    setActiveBoard(id);
                    onClose();
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      active ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"
                    )}
                  />
                  <span className="truncate">{board.title}</span>
                </button>
                <span className="text-[11px] text-slate-400">{count}</span>
                {boardOrder.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete board "${board.title}"?`))
                        deleteBoard(id);
                    }}
                    className="rounded p-1 text-slate-400 opacity-0 transition hover:bg-rose-100 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-500/20"
                    aria-label="Delete board"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {adding && (
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitAdd();
                  if (e.key === "Escape") {
                    setAdding(false);
                    setName("");
                  }
                }}
                placeholder="Board name"
                className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-slate-400"
              />
              <button
                onClick={commitAdd}
                className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          )}
        </nav>

        <div className="space-y-1 border-t border-slate-200 p-3 dark:border-slate-800">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>
    </>
  );
}
