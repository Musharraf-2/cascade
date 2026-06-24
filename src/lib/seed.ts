import { nanoid } from "nanoid";
import type { Board, Card, Column, Label } from "./types";

interface SeedResult {
  boards: Record<string, Board>;
  columns: Record<string, Column>;
  cards: Record<string, Card>;
  boardOrder: string[];
  activeBoardId: string;
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

/** Builds a friendly demo board so a first-time visitor sees Cascade in action. */
export function createSeed(): SeedResult {
  const boardId = nanoid();

  const labels: Label[] = [
    { id: nanoid(), name: "Design", color: "violet" },
    { id: nanoid(), name: "Frontend", color: "sky" },
    { id: nanoid(), name: "Bug", color: "rose" },
    { id: nanoid(), name: "Docs", color: "amber" },
    { id: nanoid(), name: "Done well", color: "emerald" },
  ];

  const columns: Record<string, Column> = {};
  const cards: Record<string, Card> = {};

  const now = Date.now();
  const mkCard = (
    columnId: string,
    data: Partial<Card> & { title: string }
  ): string => {
    const id = nanoid();
    cards[id] = {
      id,
      columnId,
      title: data.title,
      description: data.description ?? "",
      labelIds: data.labelIds ?? [],
      dueDate: data.dueDate ?? null,
      priority: data.priority ?? null,
      checklist: data.checklist ?? [],
      activity: [{ id: nanoid(), text: "Card created", at: now }],
      createdAt: now,
    };
    return id;
  };

  const colDefs = [
    {
      title: "Backlog",
      cards: [
        {
          title: "Research competitor onboarding flows",
          labelIds: [labels[0].id],
          priority: "low" as const,
        },
        {
          title: "Collect feedback from beta users",
          labelIds: [labels[3].id],
          dueDate: daysFromNow(9),
        },
      ],
    },
    {
      title: "To Do",
      cards: [
        {
          title: "Design empty states",
          description:
            "Create friendly illustrations and copy for:\n\n- Empty board\n- No search results\n- First-run experience",
          labelIds: [labels[0].id, labels[1].id],
          priority: "medium" as const,
          dueDate: daysFromNow(3),
          checklist: [
            { id: nanoid(), text: "Empty board", done: true },
            { id: nanoid(), text: "No results", done: false },
            { id: nanoid(), text: "First run", done: false },
          ],
        },
        {
          title: "Fix drag ghost flicker on Safari",
          labelIds: [labels[2].id],
          priority: "high" as const,
          dueDate: daysFromNow(-1),
        },
      ],
    },
    {
      title: "In Progress",
      cards: [
        {
          title: "Build the card detail modal",
          description:
            "Rich **markdown** description, labels, due date, priority and a checklist with a progress bar.",
          labelIds: [labels[1].id],
          priority: "high" as const,
          dueDate: daysFromNow(0),
          checklist: [
            { id: nanoid(), text: "Layout", done: true },
            { id: nanoid(), text: "Markdown editor", done: true },
            { id: nanoid(), text: "Checklist", done: false },
          ],
        },
      ],
    },
    {
      title: "Done",
      cards: [
        {
          title: "Set up drag & drop with dnd-kit",
          labelIds: [labels[1].id, labels[4].id],
          priority: "medium" as const,
        },
        {
          title: "Dark mode + theming",
          labelIds: [labels[0].id, labels[4].id],
        },
      ],
    },
  ];

  const columnIds: string[] = [];
  for (const def of colDefs) {
    const colId = nanoid();
    columnIds.push(colId);
    const cardIds = def.cards.map((c) => mkCard(colId, c));
    columns[colId] = {
      id: colId,
      boardId,
      title: def.title,
      cardIds,
    };
  }

  const board: Board = {
    id: boardId,
    title: "Cascade Roadmap",
    columnIds,
    labels,
  };

  return {
    boards: { [boardId]: board },
    columns,
    cards,
    boardOrder: [boardId],
    activeBoardId: boardId,
  };
}
