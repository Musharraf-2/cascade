import type { LabelColor, Priority } from "./types";

export const LABEL_COLORS: LabelColor[] = [
  "rose",
  "orange",
  "amber",
  "lime",
  "emerald",
  "cyan",
  "sky",
  "indigo",
  "violet",
  "fuchsia",
];

/** Solid swatch used in pickers and the thin strip on a card. */
export const labelSolid: Record<LabelColor, string> = {
  rose: "bg-rose-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  lime: "bg-lime-500",
  emerald: "bg-emerald-500",
  cyan: "bg-cyan-500",
  sky: "bg-sky-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  fuchsia: "bg-fuchsia-500",
};

/** Soft chip style used for label pills. */
export const labelSoft: Record<LabelColor, string> = {
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  lime: "bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  indigo:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  violet:
    "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  fuchsia:
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; chip: string; dot: string }
> = {
  low: {
    label: "Low",
    chip: "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  medium: {
    label: "Medium",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  high: {
    label: "High",
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};
