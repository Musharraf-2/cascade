import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useStore } from "../lib/store";

export function AddColumn() {
  const addColumn = useStore((s) => s.addColumn);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const commit = () => {
    if (title.trim()) addColumn(title.trim());
    setTitle("");
    setAdding(false);
  };

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="flex w-72 shrink-0 items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-500 transition hover:border-indigo-400 hover:bg-white/50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-500/60 dark:hover:bg-slate-800/50"
      >
        <Plus className="h-4 w-4" />
        Add a list
      </button>
    );
  }

  return (
    <div className="w-72 shrink-0 rounded-2xl bg-slate-200/60 p-2 dark:bg-slate-900/70">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setAdding(false);
            setTitle("");
          }
        }}
        placeholder="List title…"
        className="w-full rounded-lg border border-indigo-300 bg-white px-2.5 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-indigo-500/50 dark:bg-slate-800"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={commit}
          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Add list
        </button>
        <button
          onClick={() => {
            setAdding(false);
            setTitle("");
          }}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
