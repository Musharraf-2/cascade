import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useStore } from "../lib/store";
import { Column } from "./Column";
import { CardItem } from "./CardItem";
import { AddColumn } from "./AddColumn";
import { CardModal } from "./CardModal";
import type { Card, Column as ColumnType } from "../lib/types";

interface Props {
  boardId: string;
}

type Active =
  | { type: "Card"; card: Card }
  | { type: "Column"; column: ColumnType }
  | null;

export function BoardView({ boardId }: Props) {
  const board = useStore((s) => s.boards[boardId]);
  const columns = useStore((s) => s.columns);
  const cards = useStore((s) => s.cards);
  const moveCard = useStore((s) => s.moveCard);
  const reorderColumns = useStore((s) => s.reorderColumns);
  const openCardId = useStore((s) => s.openCardId);

  const [active, setActive] = useState<Active>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnIds = useMemo(
    () => board?.columnIds ?? [],
    [board?.columnIds]
  );

  if (!board) return null;

  const onDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current;
    if (data?.type === "Column") {
      setActive({ type: "Column", column: columns[e.active.id as string] });
    } else if (data?.type === "Card") {
      setActive({ type: "Card", card: cards[e.active.id as string] });
    }
  };

  const onDragOver = (e: DragOverEvent) => {
    const { active: a, over } = e;
    if (!over) return;
    const activeId = a.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;
    if (a.data.current?.type !== "Card") return;
    // Only react when over a card or a column droppable.
    const overIsCard = over.data.current?.type === "Card";
    const overIsColumn = over.data.current?.type === "Column";
    if (!overIsCard && !overIsColumn) return;
    moveCard(activeId, overId);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const { active: a, over } = e;
    if (!over) return;
    const activeId = a.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;
    if (a.data.current?.type === "Column") {
      reorderColumns(activeId, overId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="flex h-full items-start gap-4 overflow-x-auto overflow-y-hidden p-4">
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          {columnIds.map((id) => (
            <Column key={id} columnId={id} />
          ))}
        </SortableContext>
        <AddColumn />
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {active?.type === "Card" ? (
          <div className="w-72 rotate-2">
            <CardItem card={active.card} overlay />
          </div>
        ) : active?.type === "Column" ? (
          <div className="w-72 opacity-90">
            <Column columnId={active.column.id} overlay />
          </div>
        ) : null}
      </DragOverlay>

      {openCardId && <CardModal cardId={openCardId} />}
    </DndContext>
  );
}
