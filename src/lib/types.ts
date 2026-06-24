export type Priority = "low" | "medium" | "high";

export type LabelColor =
  | "rose"
  | "orange"
  | "amber"
  | "lime"
  | "emerald"
  | "cyan"
  | "sky"
  | "indigo"
  | "violet"
  | "fuchsia";

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Activity {
  id: string;
  text: string;
  at: number;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string;
  labelIds: string[];
  dueDate: string | null;
  priority: Priority | null;
  checklist: ChecklistItem[];
  activity: Activity[];
  createdAt: number;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  cardIds: string[];
}

export interface Board {
  id: string;
  title: string;
  columnIds: string[];
  labels: Label[];
}

export interface Filters {
  query: string;
  labelIds: string[];
  priority: Priority | null;
  due: "all" | "overdue" | "today" | "week";
}
