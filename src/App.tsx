import { useEffect, useState } from "react";
import { useStore } from "./lib/store";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { BoardView } from "./components/BoardView";
import { BoardSkeleton } from "./components/Skeletons";
import { EmptyState } from "./components/EmptyState";
import { LayoutGrid } from "lucide-react";

export default function App() {
  const theme = useStore((s) => s.theme);
  const activeBoardId = useStore((s) => s.activeBoardId);
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply the theme to <html> for Tailwind's class-based dark mode.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Brief skeleton on first paint to showcase loading states.
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setSidebarOpen(true)} loading={!hydrated} />

        <main className="min-h-0 flex-1 overflow-hidden">
          {!hydrated ? (
            <BoardSkeleton />
          ) : activeBoardId ? (
            <BoardView boardId={activeBoardId} />
          ) : (
            <EmptyState
              icon={<LayoutGrid className="h-10 w-10" />}
              title="No board selected"
              description="Create a board from the sidebar to start organizing your work."
            />
          )}
        </main>
      </div>
    </div>
  );
}
