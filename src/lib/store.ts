import { create } from "zustand";
import { persist } from "zustand/middleware";
import { arrayMove } from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { createSeed } from "./seed";
import { LABEL_COLORS } from "./theme";
import type {
  Board,
  Card,
  Column,
  Filters,
  Label,
  LabelColor,
  Priority,
} from "./types";

type Theme = "light" | "dark";

interface State {
  boards: Record<string, Board>;
  columns: Record<string, Column>;
  cards: Record<string, Card>;
  boardOrder: string[];
  activeBoardId: string | null;
  theme: Theme;
  filters: Filters;
  openCardId: string | null;

  // boards
  addBoard: (title: string) => void;
  renameBoard: (boardId: string, title: string) => void;
  deleteBoard: (boardId: string) => void;
  setActiveBoard: (boardId: string) => void;

  // columns
  addColumn: (title: string) => void;
  renameColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;
  reorderColumns: (activeId: string, overId: string) => void;

  // cards
  addCard: (columnId: string, title: string) => void;
  updateCard: (
    cardId: string,
    patch: Partial<Omit<Card, "id" | "columnId" | "activity">>,
    activityText?: string
  ) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (activeId: string, overId: string) => void;

  // checklist
  addChecklistItem: (cardId: string, text: string) => void;
  toggleChecklistItem: (cardId: string, itemId: string) => void;
  deleteChecklistItem: (cardId: string, itemId: string) => void;

  // labels (board-scoped)
  addLabel: (name: string, color: LabelColor) => void;
  updateLabel: (labelId: string, patch: Partial<Omit<Label, "id">>) => void;
  deleteLabel: (labelId: string) => void;
  toggleCardLabel: (cardId: string, labelId: string) => void;

  // ui
  toggleTheme: () => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  toggleFilterLabel: (labelId: string) => void;
  clearFilters: () => void;
  setOpenCard: (cardId: string | null) => void;
}

const emptyFilters: Filters = {
  query: "",
  labelIds: [],
  priority: null,
  due: "all",
};

function logActivity(card: Card, text: string): Card {
  return {
    ...card,
    activity: [
      { id: nanoid(), text, at: Date.now() },
      ...card.activity,
    ].slice(0, 50),
  };
}

const seed = createSeed();

export const useStore = create<State>()(
  persist(
    (set) => ({
      boards: seed.boards,
      columns: seed.columns,
      cards: seed.cards,
      boardOrder: seed.boardOrder,
      activeBoardId: seed.activeBoardId,
      theme: "light",
      filters: emptyFilters,
      openCardId: null,

      addBoard: (title) =>
        set((state) => {
          const id = nanoid();
          const board: Board = { id, title, columnIds: [], labels: [] };
          return {
            boards: { ...state.boards, [id]: board },
            boardOrder: [...state.boardOrder, id],
            activeBoardId: id,
            filters: emptyFilters,
          };
        }),

      renameBoard: (boardId, title) =>
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: { ...state.boards[boardId], title },
          },
        })),

      deleteBoard: (boardId) =>
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return {};
          const boards = { ...state.boards };
          const columns = { ...state.columns };
          const cards = { ...state.cards };
          for (const colId of board.columnIds) {
            for (const cardId of columns[colId]?.cardIds ?? []) {
              delete cards[cardId];
            }
            delete columns[colId];
          }
          delete boards[boardId];
          const boardOrder = state.boardOrder.filter((id) => id !== boardId);
          const activeBoardId =
            state.activeBoardId === boardId
              ? boardOrder[0] ?? null
              : state.activeBoardId;
          return { boards, columns, cards, boardOrder, activeBoardId };
        }),

      setActiveBoard: (boardId) =>
        set({ activeBoardId: boardId, filters: emptyFilters }),

      addColumn: (title) =>
        set((state) => {
          const boardId = state.activeBoardId;
          if (!boardId) return {};
          const id = nanoid();
          const column: Column = { id, boardId, title, cardIds: [] };
          return {
            columns: { ...state.columns, [id]: column },
            boards: {
              ...state.boards,
              [boardId]: {
                ...state.boards[boardId],
                columnIds: [...state.boards[boardId].columnIds, id],
              },
            },
          };
        }),

      renameColumn: (columnId, title) =>
        set((state) => ({
          columns: {
            ...state.columns,
            [columnId]: { ...state.columns[columnId], title },
          },
        })),

      deleteColumn: (columnId) =>
        set((state) => {
          const column = state.columns[columnId];
          if (!column) return {};
          const columns = { ...state.columns };
          const cards = { ...state.cards };
          for (const cardId of column.cardIds) delete cards[cardId];
          delete columns[columnId];
          const board = state.boards[column.boardId];
          return {
            columns,
            cards,
            boards: {
              ...state.boards,
              [board.id]: {
                ...board,
                columnIds: board.columnIds.filter((id) => id !== columnId),
              },
            },
          };
        }),

      reorderColumns: (activeId, overId) =>
        set((state) => {
          const boardId = state.activeBoardId;
          if (!boardId) return {};
          const board = state.boards[boardId];
          const from = board.columnIds.indexOf(activeId);
          const to = board.columnIds.indexOf(overId);
          if (from === -1 || to === -1) return {};
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columnIds: arrayMove(board.columnIds, from, to),
              },
            },
          };
        }),

      addCard: (columnId, title) =>
        set((state) => {
          const id = nanoid();
          const card: Card = {
            id,
            columnId,
            title,
            description: "",
            labelIds: [],
            dueDate: null,
            priority: null,
            checklist: [],
            activity: [{ id: nanoid(), text: "Card created", at: Date.now() }],
            createdAt: Date.now(),
          };
          return {
            cards: { ...state.cards, [id]: card },
            columns: {
              ...state.columns,
              [columnId]: {
                ...state.columns[columnId],
                cardIds: [...state.columns[columnId].cardIds, id],
              },
            },
          };
        }),

      updateCard: (cardId, patch, activityText) =>
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return {};
          let next: Card = { ...card, ...patch };
          if (activityText) next = logActivity(next, activityText);
          return { cards: { ...state.cards, [cardId]: next } };
        }),

      deleteCard: (cardId) =>
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return {};
          const cards = { ...state.cards };
          delete cards[cardId];
          const column = state.columns[card.columnId];
          return {
            cards,
            columns: {
              ...state.columns,
              [column.id]: {
                ...column,
                cardIds: column.cardIds.filter((id) => id !== cardId),
              },
            },
          };
        }),

      moveCard: (activeId, overId) =>
        set((state) => {
          const activeCard = state.cards[activeId];
          if (!activeCard) return {};

          const fromColumn = state.columns[activeCard.columnId];
          // The target is either a card (drop onto/before a card) or a column.
          const overCard = state.cards[overId];
          const toColumn = overCard
            ? state.columns[overCard.columnId]
            : state.columns[overId];
          if (!toColumn) return {};

          // Reordering within the same column.
          if (fromColumn.id === toColumn.id) {
            if (!overCard) return {};
            const from = fromColumn.cardIds.indexOf(activeId);
            const to = fromColumn.cardIds.indexOf(overId);
            if (from === -1 || to === -1 || from === to) return {};
            return {
              columns: {
                ...state.columns,
                [fromColumn.id]: {
                  ...fromColumn,
                  cardIds: arrayMove(fromColumn.cardIds, from, to),
                },
              },
            };
          }

          // Moving across columns.
          const fromIds = fromColumn.cardIds.filter((id) => id !== activeId);
          const insertAt = overCard
            ? toColumn.cardIds.indexOf(overId)
            : toColumn.cardIds.length;
          const toIds = [...toColumn.cardIds];
          toIds.splice(insertAt < 0 ? toIds.length : insertAt, 0, activeId);

          return {
            columns: {
              ...state.columns,
              [fromColumn.id]: { ...fromColumn, cardIds: fromIds },
              [toColumn.id]: { ...toColumn, cardIds: toIds },
            },
            cards: {
              ...state.cards,
              [activeId]: logActivity(
                { ...activeCard, columnId: toColumn.id },
                `Moved to "${toColumn.title}"`
              ),
            },
          };
        }),

      addChecklistItem: (cardId, text) =>
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return {};
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                checklist: [
                  ...card.checklist,
                  { id: nanoid(), text, done: false },
                ],
              },
            },
          };
        }),

      toggleChecklistItem: (cardId, itemId) =>
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return {};
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                checklist: card.checklist.map((i) =>
                  i.id === itemId ? { ...i, done: !i.done } : i
                ),
              },
            },
          };
        }),

      deleteChecklistItem: (cardId, itemId) =>
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return {};
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                checklist: card.checklist.filter((i) => i.id !== itemId),
              },
            },
          };
        }),

      addLabel: (name, color) =>
        set((state) => {
          const boardId = state.activeBoardId;
          if (!boardId) return {};
          const board = state.boards[boardId];
          const label: Label = { id: nanoid(), name, color };
          return {
            boards: {
              ...state.boards,
              [boardId]: { ...board, labels: [...board.labels, label] },
            },
          };
        }),

      updateLabel: (labelId, patch) =>
        set((state) => {
          const boardId = state.activeBoardId;
          if (!boardId) return {};
          const board = state.boards[boardId];
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                labels: board.labels.map((l) =>
                  l.id === labelId ? { ...l, ...patch } : l
                ),
              },
            },
          };
        }),

      deleteLabel: (labelId) =>
        set((state) => {
          const boardId = state.activeBoardId;
          if (!boardId) return {};
          const board = state.boards[boardId];
          const cards = { ...state.cards };
          for (const id of Object.keys(cards)) {
            if (cards[id].labelIds.includes(labelId)) {
              cards[id] = {
                ...cards[id],
                labelIds: cards[id].labelIds.filter((l) => l !== labelId),
              };
            }
          }
          return {
            cards,
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                labels: board.labels.filter((l) => l.id !== labelId),
              },
            },
            filters: {
              ...state.filters,
              labelIds: state.filters.labelIds.filter((l) => l !== labelId),
            },
          };
        }),

      toggleCardLabel: (cardId, labelId) =>
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return {};
          const has = card.labelIds.includes(labelId);
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                labelIds: has
                  ? card.labelIds.filter((l) => l !== labelId)
                  : [...card.labelIds, labelId],
              },
            },
          };
        }),

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),

      setFilter: (key, value) =>
        set((state) => ({ filters: { ...state.filters, [key]: value } })),

      toggleFilterLabel: (labelId) =>
        set((state) => {
          const has = state.filters.labelIds.includes(labelId);
          return {
            filters: {
              ...state.filters,
              labelIds: has
                ? state.filters.labelIds.filter((l) => l !== labelId)
                : [...state.filters.labelIds, labelId],
            },
          };
        }),

      clearFilters: () => set({ filters: emptyFilters }),

      setOpenCard: (cardId) => set({ openCardId: cardId }),
    }),
    {
      name: "cascade-store",
      partialize: (state) => ({
        boards: state.boards,
        columns: state.columns,
        cards: state.cards,
        boardOrder: state.boardOrder,
        activeBoardId: state.activeBoardId,
        theme: state.theme,
      }),
    }
  )
);

/** Next color in the palette, used when creating a new label. */
export function nextLabelColor(existing: Label[]): LabelColor {
  const used = new Set(existing.map((l) => l.color));
  return LABEL_COLORS.find((c) => !used.has(c)) ?? LABEL_COLORS[0];
}

export type { Priority };
