# Momentum

Local-first timeline app for **writers** and **history learners**. Place events on a chronological axis so simultaneity, gaps, and “what’s next” are easy to see.

## Status

Planning complete (MVP product, UX, stack, and R1–R12 locked). Scaffolding and Phase 1 are next.

Full product plan: [`PLAN.md`](./PLAN.md)

## MVP at a glance

- **Dashboard** of multiple timelines (local stand-in for an account)
- **Events** as dated documents (title + body; free-form year, optional month/day)
- Timeline shows **title + date only**; click through for the full entry
- Scale: **Year / Month / Day**; orientation: vertical or horizontal
- Data stays on-device (**Dexie** / IndexedDB)
- **JSON** import/export per timeline; single-event **`.docx`** export
- Search within a timeline (title + body)

## Stack (locked)

| Layer | Choice |
|-------|--------|
| App | Vite + React + TypeScript |
| Styling | Tailwind + CSS variables |
| Routing | React Router |
| Local DB | Dexie (IndexedDB) |
| Validation | Zod |
| Deploy | Cloudflare Pages (static shell; data stays in the browser) |

## Project layout (planned)

```
src/
  pages/        # dashboard, timeline, event detail, settings
  components/
  data/         # Dexie + repositories
  lib/          # import/export, search, date helpers
  types/
```

## Getting started

App scaffolding is not in the repo yet. When Phase 1 lands:

```bash
npm install
npm run dev
```

## License

TBD
