function SkeletonCard() {
  return (
    <div className="shimmer rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
      <div className="mb-2 flex gap-1.5">
        <div className="h-2 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-2 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="mb-1.5 h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-3 w-3/5 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

function SkeletonColumn({ cards }: { cards: number }) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl bg-slate-200/60 p-3 dark:bg-slate-900/60">
      <div className="h-4 w-24 rounded bg-slate-300 dark:bg-slate-700" />
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="flex h-full gap-4 overflow-hidden p-4">
      <SkeletonColumn cards={2} />
      <SkeletonColumn cards={3} />
      <SkeletonColumn cards={1} />
      <SkeletonColumn cards={2} />
    </div>
  );
}
