# Momentum — Development Steps

Living checklist of work completed and work ahead. Product requirements stay in [`PLAN.md`](./PLAN.md); this file tracks **how we build**.

**Last updated:** 2026-09-25

---

## Legend

- [x] Done
- [ ] Not started / in progress

---

## 0. Repo & planning

- [x] Write product plan (`PLAN.md`) — audience, MVP, R1–R12, stack
- [x] Create GitHub remote (`BelenLapadat/Momentum`)
- [x] Init local git, connect SSH remote, push `PLAN.md`
- [x] Add project `README.md`
- [x] Confirm storage model: Dexie/IndexedDB source of truth; JSON export/import for backup (not filesystem event files)
- [x] Add this development steps checklist (`DEVELOPMENT.md`)

---

## 1. Scaffold

- [x] Vite + React + TypeScript in `momentum/` (keep `PLAN.md` / `README.md`)
- [x] Tailwind CSS v4 + CSS variables / brand styling
- [x] React Router routes (data router / `createBrowserRouter`):
  - `/` — Dashboard
  - `/timeline/:timelineId` — Timeline view
  - `/timeline/:timelineId/events/new` — New event
  - `/timeline/:timelineId/events/:eventId` — Event detail
  - `/timeline/:timelineId/settings` — Settings / import-export
- [x] Install deps: Dexie, Zod, `docx`, Vitest + Testing Library
- [x] `.gitignore`, scripts (`dev`, `build`, `test`)
- [x] Update README getting-started

---

## 2. Data spine

- [x] Zod schemas + types: `Timeline`, `TimelineEvent`, `Scale`, `Orientation`, export payload
- [x] Dexie DB: `timelines`, `events` tables
- [x] `timelineRepository` — list / get / create / update / remove (cascade events)
- [x] `eventRepository` — list by timeline / get / create / update / remove; touch parent `updatedAt`
- [x] Chronology helpers (R1 placement, R2 sort, focus step, search match)
- [x] Vitest coverage for chronology helpers
- [x] Prefs helpers: scale + orientation in `localStorage` (R8)

---

## 3. First vertical slice (“app works”)

- [x] Dashboard: list by `updatedAt` desc (R12), empty state, create / edit / delete timeline (confirm + event count — R6)
- [x] Open timeline → empty state → Add event
- [x] Event detail: title, typed year, optional month/day, plain-text body
- [x] Save → return to timeline; date edits re-sort
- [x] Timeline markers: title + date only; click opens detail
- [x] Persist across refresh (Dexie)
- [x] Dirty leave prompt on unsaved event edits (R7) via confirm + `beforeunload`
- [x] Manual smoke on localhost (`npm run dev`)
- [x] Fix Add event crash (`useBlocker` required a data router → switched approach)

---

## 4. Phase 1 shell (scale, orientation, search)

- [x] Scale control: Year / Month / Day
- [x] Orientation: vertical / horizontal (same marker data)
- [x] Persist scale + orientation in `localStorage`
- [x] Month/Day focus: typed year jump + prev/next (R4)
- [x] Search: title + body; filter + highlight matches

---

## 5. Phase 2 I/O & polish (MVP extras)

- [x] JSON export of current timeline
- [x] JSON import: ask merge vs create new timeline (R11)
- [x] Import conflicts by `id` only — keep vs overwrite (R3); no id → new event
- [x] Single-event `.docx` export from detail (lazy-loaded)
- [x] Basic responsive layout / empty states
- [x] Commit MVP scaffold + push to `origin/main`

---

## 6. UI / UX refinements (2026-09-25)

- [x] Shift palette from green to **gold + stone neutrals**
- [x] Dashboard Open / Edit / Delete → **icon buttons**
- [x] Date labels: month **abbreviations**; order **year → month → day**
- [x] Group events by year (year shown once)
- [x] Unknown-month events: **“sometime this year”** `h3` + `ul` when the year has multiple events; listed **above** dated events
- [x] Reject impossible calendar days (e.g. 30 Feb); purge invalid stored events so timelines still open
- [x] Vertical year markers: opaque **circles** on the axis; line masked behind the circle
- [x] Typography: **Manrope** minimalist sans-serif (brand + body)
- [x] Update `PLAN.md` + this file to match today’s work

---

## 7. Next — harden & ship checklist

### 7a. Verify & fix from real use

- [x] Click through create timeline / add event / save path (Add event fixed)
- [x] Confirm impossible-day validation
- [ ] More pass on extreme years (e.g. `-44`, `2145`) in the polished UI
- [ ] Confirm delete timeline cascades events; prompts still feel right after icon UI
- [ ] Note any new friction from year-grouping / “sometime this year” layout

### 7b. Quality bar

- [x] `npm test` green (as of today’s polish)
- [x] `npm run build` green (as of today’s polish)
- [ ] Quick mobile-width check in browser after latest UI changes
- [x] Push `main` to `origin` (MVP + docs already pushed; push today’s polish when ready)

### 7c. Small MVP follow-ups (still in scope if needed)

- [ ] Clearer empty / loading / error copy where thin
- [ ] “Apply to all remaining conflicts” on import (optional, parked in PLAN Phase 3)
- [ ] Keyboard shortcuts: add event / scale / search (optional)
- [ ] Accessibility pass (focus traps in modals, labels, contrast)
- [ ] Commit + push today’s UI polish commits

### 7d. Deploy (static shell)

- [ ] Set up Cloudflare Pages (or Netlify / GitHub Pages) for the Vite build
- [ ] Document deploy steps in README
- [ ] Verify production build still keeps data local to the browser

---

## 8. Later — post-MVP (from PLAN.md; do not start until MVP feels solid)

### Phase 3 — Polish / power features

- [ ] Threads or tags for parallel strands
- [ ] Year-range filter / jump refinements
- [ ] Bulk `.docx` / Markdown export
- [ ] Stronger empty, loading, and error states

### Phase 4 — Stretch

- [ ] Continuous zoom / pan (in addition to Year/Month/Day)
- [ ] Era display (BCE/CE) and optional calendar labeling
- [ ] Images, maps, reference links on events
- [ ] Dashboard-level JSON export/import (all timelines)
- [ ] Cloud sync / accounts behind the same repositories
- [ ] PWA / offline install
- [ ] Optional CSV import/export
- [ ] Desktop shell (Tauri) if needed

---

## Suggested working order from here

1. Commit/push today’s UI polish when you are happy with it.
2. Mobile-width check + any remaining 7a friction notes.
3. Deploy static host (**7d**).
4. Only then pick items from **7c** or Phase 3/4 deliberately — avoid scope creep.

---

## Commands cheat sheet

```bash
cd Documents/workspace/personal_projects/momentum
npm install
npm run dev      # http://localhost:5173/
npm test
npm run build
```

---

## Notes

- Events live in **IndexedDB via Dexie**, not as files on disk. Portable copies = JSON / `.docx` export.
- UI never talks to Dexie directly; repositories are the seam for a future cloud backend.
- Product locks and the 2026-09-25 UX refinement table live in [`PLAN.md`](./PLAN.md).
