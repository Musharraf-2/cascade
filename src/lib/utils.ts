import clsx, { type ClassValue } from "clsx";
import {
  differenceInCalendarDays,
  isPast,
  isToday,
  isTomorrow,
  format,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export type DueStatus = "none" | "overdue" | "today" | "soon" | "upcoming";

export function getDueStatus(dueDate: string | null): DueStatus {
  if (!dueDate) return "none";
  const date = new Date(dueDate);
  if (isToday(date)) return "today";
  if (isPast(date)) return "overdue";
  const days = differenceInCalendarDays(date, new Date());
  if (days <= 7) return "soon";
  return "upcoming";
}

export function formatDue(dueDate: string): string {
  const date = new Date(dueDate);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

export function formatRelative(ts: number): string {
  const days = differenceInCalendarDays(new Date(), new Date(ts));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return format(new Date(ts), "MMM d");
}

export const DUE_STATUS_CHIP: Record<DueStatus, string> = {
  none: "",
  overdue:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  today:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  soon: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  upcoming:
    "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300",
};
