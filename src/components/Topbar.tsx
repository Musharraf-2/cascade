import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { useStore } from "../lib/store";
import { FilterMenu } from "./FilterMenu";
import { cn } from "../lib/utils";

interface Props {
  onMenu: () => void;
  loading: boolean;
}

export function Topbar({ onMenu, loading }: Props) {
  const activeBoardId = useStore((s) => s.activeBoardId);
  const board = useStore((s) =>
    s.activeBoardId ? s.boards[s.activeBoardId] : null
  );
  const cardCount = useStore((s) =>
    s.activeBoardId
      ? s.boards[s.activeBoardId]?.columnIds.reduce(
          (sum, cid) => sum + (s.columns[cid]?.cardIds.length ?? 0),
          0
        )
      : 0
  );
  const renameBoard = useStore((s) => s.renameBoard);
  const query = useStore((s) => s.filters.query);
  const setFilter = useStore((s) => s.setFilter);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    if (!board) return;
    setTitle(board.title);
    setEditing(true);
  };

  const commit = () => {
    if (board && title.trim()) renameBoard(board.id, title.trim());
    setEditing(false);
  };

  return (
    <header className="flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        {loading ? (
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        ) : editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="min-w-0 max-w-xs rounded-lg border border-indigo-300 bg-transparent px-2 py-1 text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-indigo-500/50"
          />
        ) : (
          <button
            onClick={startEdit}
            className="truncate rounded-lg px-2 py-1 text-lg font-extrabold tracking-tight transition hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Click to rename"
          >
            {board?.title ?? "Cascade"}
          </button>
        )}
        {!loading && activeBoardId && (
          <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline">
            {cardCount} {cardCount === 1 ? "card" : "cards"}
          </span>
        )}
      </div>

      {activeBoardId && !loading && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800",
              "w-36 focus-within:w-48 sm:w-52 sm:focus-within:w-64"
            )}
          >
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setFilter("query", e.target.value)}
              placeholder="Search cards…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {query && (
              <button
                onClick={() => setFilter("query", "")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <FilterMenu />
        </div>
      )}
    </header>
  );
}
