import { differenceInCalendarDays, isPast, isToday } from "date-fns";
import type { Card, Filters } from "./types";

/** Returns true when a card should be visible under the active filters. */
export function cardMatchesFilters(card: Card, filters: Filters): boolean {
  const q = filters.query.trim().toLowerCase();
  if (q) {
    const haystack = `${card.title} ${card.description}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  if (filters.labelIds.length > 0) {
    const hasAll = filters.labelIds.every((id) => card.labelIds.includes(id));
    if (!hasAll) return false;
  }

  if (filters.priority && card.priority !== filters.priority) return false;

  if (filters.due !== "all") {
    if (!card.dueDate) return false;
    const date = new Date(card.dueDate);
    if (filters.due === "overdue" && !(isPast(date) && !isToday(date)))
      return false;
    if (filters.due === "today" && !isToday(date)) return false;
    if (filters.due === "week") {
      const days = differenceInCalendarDays(date, new Date());
      if (days < 0 || days > 7) return false;
    }
  }

  return true;
}

export function filtersActive(filters: Filters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.labelIds.length > 0 ||
    filters.priority !== null ||
    filters.due !== "all"
  );
}
