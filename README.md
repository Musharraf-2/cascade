# 🌊 Cascade

> **Flow your work.** A modern, polished Kanban board built with React, TypeScript & dnd-kit — drag & drop, labels, due dates, checklists, markdown, dark mode, and more. All state persists locally, so it works fully offline with zero backend.

<p align="left">
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white" />
</p>

---

## ✨ Features

### Core
- **Multiple boards** — create, rename, and delete boards from the sidebar.
- **Lists / columns** — add, rename, reorder, and delete columns.
- **Cards** — create, edit, and delete cards with a rich detail view.
- **Drag & drop** — reorder cards within a list, move cards across lists, and reorder lists themselves (powered by [`@dnd-kit`](https://dndkit.com), keyboard-accessible).
- **Offline persistence** — everything is saved to `localStorage` automatically.

### Intermediate
- **🏷️ Labels** — color-coded, board-scoped labels you can create on the fly and filter by.
- **📅 Due dates** — with smart visual cues for *overdue*, *today*, and *upcoming*.
- **✅ Checklists** — subtasks with a live progress bar.
- **🚦 Priorities** — Low / Medium / High with at-a-glance badges.
- **📝 Markdown descriptions** — write rich descriptions with full GFM support.
- **🕓 Activity log** — every card tracks key changes (moved, due date set, etc.).
- **🔍 Search & filter** — instant search plus filtering by label, priority, and due date.
- **🌗 Dark mode** — beautiful light & dark themes with a one-click toggle.
- **📱 Responsive** — works great from mobile to desktop.
- **💀 Skeletons & empty states** — thoughtful loading and zero-data UX.

---

## 🛠️ Tech Stack

| Concern            | Choice                                  |
| ------------------ | --------------------------------------- |
| Framework          | React 18 + TypeScript                   |
| Build tool         | Vite 5                                   |
| State management   | Zustand (with `persist` middleware)     |
| Drag & drop        | @dnd-kit (core + sortable)              |
| Styling            | Tailwind CSS                            |
| Markdown           | react-markdown + remark-gfm             |
| Dates              | date-fns                                |
| Icons              | lucide-react                            |

---

## 🚀 Getting Started

> Requires **Node.js 18+**.

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# type-check + build for production
npm run build

# preview the production build
npm run preview
```

---

## 🧠 Architecture Notes

The data model is **normalized** — boards, columns, and cards live in flat
lookup maps, and ordering is stored as arrays of IDs:

```ts
Board  { id, title, columnIds: string[], labels: Label[] }
Column { id, boardId, title, cardIds: string[] }
Card   { id, columnId, title, description, labelIds, dueDate, priority, checklist, activity }
```

Storing **arrays of IDs** rather than nested objects is the key trick that makes
drag-and-drop reordering (and moving cards between columns) simple and fast — the
heavy lifting lives in a single `moveCard` reducer in [`src/lib/store.ts`](src/lib/store.ts).

```
src/
├─ components/      # UI: Sidebar, Topbar, BoardView, Column, CardItem, CardModal, …
├─ lib/
│  ├─ store.ts      # Zustand store: all state + actions + persistence
│  ├─ types.ts      # Domain types
│  ├─ filter.ts     # Search/label/priority/due filtering
│  ├─ seed.ts       # Friendly first-run demo board
│  ├─ theme.ts      # Label & priority color tokens
│  └─ utils.ts      # cn() + date helpers
├─ hooks.ts         # useDismiss (click-outside + Escape)
└─ App.tsx          # Layout, theme, first-paint skeleton
```

---

## 🗺️ Possible Next Steps

Cascade is intentionally backend-free, but it's structured to grow:

- 🔐 Auth + a real database (Supabase / Firebase)
- 👥 Real-time multi-user collaboration
- 📎 Attachments & comments
- ⌨️ Command palette and keyboard shortcuts