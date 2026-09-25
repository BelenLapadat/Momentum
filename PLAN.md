# Momentum — Timeline App Plan

## Vision

Momentum helps people **see how events relate across time**—especially what happens at the same moment or in the near future relative to something else.

It serves two closely related audiences:

1. **Writers** — Build story structure by placing plot events on a timeline, spotting gaps, overlaps, and cause-and-effect as the narrative unfolds.
2. **History learners** — Visualize historical events in sequence and in parallel, so concurrent developments and “what’s next” are easier to grasp than a flat list of dates.

The core experience is chronological views that make **simultaneity and proximity in time** obvious—calm and intentional. Users manage **multiple timelines** (e.g. one novel, one historical period) from a simple home dashboard.

**Working product name:** Momentum  
**Status:** MVP implemented locally and on GitHub — core CRUD, timeline views, import/export, and first UI polish pass (2026-09-25). Deploy and deeper polish still open.  
**Last updated:** 2026-09-25

---

## Open decisions

Most decisions are locked, including R1–R12. Implementation has started; remaining work is polish, deploy, and post-MVP.

| # | Decision | Options | Status |
|---|----------|---------|--------|
| 1 | Primary audience emphasis | Writers · History learners · Dual | Dual focus |
| 2 | Time model | Free-form year + optional month/day | **Locked** |
| 3 | Single-user vs multi-user | Solo local **Dashboard** · Cloud accounts later | Solo local (MVP); multi-timeline under Dashboard |
| 4 | Client | Web (no Electron for MVP) | **Locked:** web |
| 5 | Data ownership | Local + JSON import/export | **Locked** |
| 6 | Media | Text in MVP (`.docx` export yes) | **Locked** |
| 7 | Timeline orientation | User choice vertical/horizontal | **Locked** |
| 8 | Scale (v1) | Explicit Year/Month/Day | **Locked** |
| 9 | Continuous zoom | Post-MVP | Planned later |
| 10 | Content search | Title + body; filter + highlight | **Locked** |
| 11 | Event CRUD | Create, read, update, delete | **Locked** |
| 12 | Timeline CRUD + dashboard | Multiple timelines per **Dashboard** | **Locked** |
| 13 | Stack | See Technical approach | **Locked** |
| 14 | Implementation R1–R12 | Placement, sort, import, focus, UX confirms, prefs, host | **Locked** |

---

## Goals

### Primary
- **Multiple timelines** under a local **Dashboard** (MVP stand-in for a user account until cloud auth exists)
- **Dashboard home** to view and manage all timelines
- Full **CRUD for timelines**: create, open (read), rename/update metadata, delete
- Visual timeline of events placed on a year / month / day scale (inside a selected timeline)
- Create events as dated text entries (title + body) with a freely entered year (optional month/day)
- Full **CRUD for events**: create, read (timeline + detail), update, delete
- On the timeline, show **only title and date**—event body stays hidden until opened
- Open an event by clicking its title to read/edit the full entry
- **Edit** any event (title, date fields, body); if the date changes, the timeline **re-sorts automatically** so chronological order stays correct
- **Zoom / switch scale** between year, month, and day views to match what the user is working on (explicit control in v1)
- Choose timeline **orientation** (vertical or horizontal)
- Persist data **locally** on the device (no cloud account required for MVP)
- **Export** and **import** a timeline as JSON (backup / transfer; merge with conflict choices)
- Export individual events as **`.docx`** (Word-compatible)
- **Search** events by content (title and body) within the open timeline; matching events are filtered and/or highlighted

### Secondary (post-MVP)
- Relative / fictional scales beyond pure years
- Continuous zoom / pan (in addition to explicit Year/Month/Day)
- Images, maps, and reference links on events
- Additional export formats (Markdown / PDF) and bulk `.docx` export of all events
- Cloud accounts + sync (Dashboard maps to a real user account across devices)
- Sharing a read-only timeline via link
- “Around this moment” focus view
- Threads / parallel strands (characters, regions, themes) on the timeline
- Filter by tag or year range (beyond text search)
- Era labels / display formats (BCE/CE, custom calendar names)
- Export/import entire Dashboard (all timelines) in one JSON file

### Non-goals (for now)
- Cloud sync, accounts, or sign-in (Firebase deferred) — MVP “account” = local **Dashboard**
- Electron / desktop shell (Tauri optional later)
- Next.js (Vite SPA chosen instead)
- CSV as the primary backup format (JSON is canonical; CSV optional later)
- Social feed or public profiles
- Real-time collaborative editing
- Full novel-writing suite (chapters, manuscripts, grammar)
- Complex project management (tasks, Gantt as a PM tool)
- AI auto-writing of stories or history essays (optional later)
- Showing full event body inline on the timeline itself
- Metrics-style clutter on the Dashboard (it is a timeline list/manager, not analytics)

---

## User stories (MVP)

1. As a user, I see a **dashboard** of all my timelines and can open one.
2. As a user, I can **create** a new timeline (name + optional description).
3. As a user, I can **rename / update** a timeline’s metadata.
4. As a user, I can **delete** a timeline (with confirmation; deletes its events).
5. As a user, inside a timeline I see a visual time scale (years, and months/days when zoomed in).
6. As a user, I can create an event that behaves like a text document (title + body) with a year I type myself.
7. As a user, I can enter years far outside a normal calendar UI range without fighting a datepicker.
8. As a user, I can optionally add month and/or day when I know them.
9. As a user, on the timeline I only see each event’s **title and date**—not the event body.
10. As a user, clicking an event’s title opens that document’s detail view to read or edit it.
11. As a user, I can edit an event’s title, date (year/month/day), and body and save the changes.
12. As a user, if I change an event’s date, the timeline automatically rearranges so events stay in chronological order.
13. As a user, I can switch the timeline scale among **year**, **month**, and **day** via an explicit control.
14. As a user, at month or day scale I can **type a year to jump** and use **prev/next** to step through months or days.
15. As a user, I can choose whether the timeline is oriented **vertically** or **horizontally**.
16. As a user, I can see multiple events in the same year (or month/day) nearby on the timeline so concurrent/near events are scannable.
17. As a user, I can delete an event document.
18. As a user, my data is saved locally and available when I return on the same device/browser.
19. As a user, I can **export** the current timeline to a JSON file and **import** a file into a timeline (merge with conflict choices).
20. As a user, I can export an event document as a **`.docx`** file from the detail screen.
21. As a user, after I save an event, I return to the timeline automatically.
22. As a user, I can search by text (e.g. “Napoleon”) within the open timeline and see matches filtered and highlighted.

---

## Product shape

### Core concepts

| Concept | Description |
|---------|-------------|
| **Dashboard** | Local home for one browser profile — **MVP stand-in for a user account** until cloud auth. Holds and lists all of the user’s timelines. |
| **Timeline** | A named collection of events the user can open, edit, and delete; has its own chronological view |
| **Event** | A dated entry **within one timeline**: title + body text, year (optional month/day) |
| **Event body** | Full text of an event—edited in detail view, not shown on the timeline axis |
| **Scale / zoom** | Year → Month → Day subdivision of the open timeline’s view |
| **Search** | Filters/highlights events in the **open timeline** whose title or body match |
| **Thread** | Optional parallel strand—post-MVP |
| **Tag** | Lightweight label—post-MVP |

### Relationships

```
Dashboard (local ≈ user account)
  └── Timeline (many)
        └── Event (many; each event belongs to exactly one timeline)
```

### Timeline fields (locked for MVP)

- `id` (stable string)
- `title` (required — name shown on dashboard)
- `description` (optional short text)
- `createdAt` / `updatedAt`
- Deferred: cover image, color, per-timeline default scale/orientation (can use global prefs for MVP)

### Event fields (locked for MVP)

- `id` (stable string; used for JSON merge conflicts)
- `timelineId` (required — foreign key to parent timeline)
- `title` (required — what appears on the timeline axis)
- `body` (optional **plain text** — R5; detail view only)
- `year` (required, integer — unrestricted range; negative allowed)
- `month` (optional, 1–12)
- `day` (optional, 1–31; only when month is set)
- `createdAt` / `updatedAt`
- Deferred: `thread` / `tags[]`, `media[]` / `links[]`, markdown/rich text

### Time model (locked for MVP)

**Principle:** Users type the year they mean. The app does not constrain them to a browser/OS datepicker’s modern range.

| Rule | Detail |
|------|--------|
| Year input | Free-form numeric field (not `<input type="date">`) |
| Range | Any integer the product can sort/store (ancient → distant future); no “valid modern calendar” gate |
| Partial dates | Year alone is valid; month/day optional |
| Ordering | Sort by `year`, then `month`, then `day`. Within the same year: events with a month before year-only; within the same year+month: events with a day before month-only. **Missing month/day sort after more-specific dates** (R2). |
| Display | Show the number the user entered; era suffixes (BCE/CE) are a later display concern |
| Year-only at fine scales | At Month/Day scale, place at **month 1 / day 1** with a subtle **year-only** cue (R1) |
| Out of scope for MVP | Full custom calendars, named eras as the sole sort key, relative “Day 12 of the voyage” without a year |
| MVP scope | **Many timelines** under local **Dashboard**; each timeline has its own events |

**Why:** Writers and history learners often work outside “today ± a few decades.” A standard datepicker breaks ancient history and speculative futures.

### User experience (locked direction)

#### Mental model

The **Dashboard** is the local home (stand-in for a user account). It holds many **timelines**. Each **timeline** holds many **events**. Opening a timeline shows chronology; clicking an event opens its detail.

```
Dashboard (list of timelines)
        │
        │  open timeline
        ▼
Timeline view (titles + dates only)
        │
        │  click title
        ▼
Event detail (title, date fields, body)
```

#### Dashboard

- Home / first screen after load: list of all timelines (title, optional description, event count or updated date)
- Sorted by **updated recently** first (R12)
- Actions: **Create timeline**, open, rename/edit metadata, delete (**confirm**, including event count — R6)
- Empty Dashboard: prompt to create the first timeline
- Calm timeline list/manager—not an analytics dashboard
- Concurrent/near events: scannable by **proximity on the axis** only; no swimlanes in MVP (R10)

#### Timeline surface

- Visual axis marked by the active scale (years, months, or days)
- Each event appears as a compact marker: **date + title** only
- Document body is never shown on the timeline (but **is** searchable)
- Title is the affordance to open the event (link / click target)
- Empty spans of time remain visible so gaps and proximity stay obvious
- Active search filters to matches and highlights them on the timeline

#### Scale / zoom

Users choose how finely time is shown, depending on what they’re working on:

| Scale | Best for | Timeline shows |
|-------|----------|----------------|
| **Year** | Long arcs, eras, whole novels or centuries | Year ticks; events placed by year |
| **Month** | A single year or dense stretch | Months within the focused range |
| **Day** | Close plotting, battles, chapters in a short span | Days within the focused month/range |

**MVP (v1):** Explicit **Year / Month / Day** control (segmented control, tabs, or equivalent). Switching mode updates the axis and focused range. No continuous pinch/scroll zoom required in v1.

**Later:** Richer zoom control—continuous zoom/pan (scroll, pinch, trackpad) that moves smoothly across scales while keeping the explicit modes available.

- Events with only a year still appear at year scale; at Month/Day scale they render at **month 1 / day 1** with a subtle **year-only** cue (R1)

#### Orientation

- User can choose **vertical** or **horizontal** timeline layout
- Preference should persist across sessions (local setting)
- Both orientations share the same data and scale modes; only the axis direction changes

#### Detail view (the document)

- Opened from the timeline title for **viewing and editing**
- Edit title, year (typed), optional month/day, and body text
- **Save** writes locally and **returns to the timeline** automatically
- If year/month/day changed, the timeline **re-sorts and rearranges** markers into the new chronological order on return
- Creating a new event uses the same detail screen in “new” mode (not a separate modal)—see Wireframes
- User can **Export .docx** for the current document without leaving detail (download only; does not replace Save)

#### UX principles

- App entry: **Dashboard** (brand + timeline list + “New timeline”)—one clear job
- Inside a timeline: brand/title + visual chronology + “Add event”—one composition
- Chronology and scale are the visual anchor; concurrency should be scannable
- Timeline stays scannable: titles and dates only
- Year entry is typed—not buried behind a calendar widget
- Scale control is always reachable so users can adapt the view to their work
- Orientation (vertical / horizontal) is a user preference, not a fixed product choice
- Search is available on the timeline and can match event body without revealing body on the markers
- Calm typography and atmosphere; avoid metrics/widget clutter on the dashboard

### Wireframes

Screens for MVP. ASCII layouts are structural only (not visual design).

**Locked wireframe defaults:**

| Choice | Decision |
|--------|----------|
| App home | **Dashboard** listing all timelines |
| Timeline CRUD | Full create / open / update (rename, description) / delete |
| Default orientation | Vertical (user can switch to horizontal) |
| Event detail | Full screen / full route (document-focused), not a side drawer |
| New event | Same detail screen, empty (“New event”) |
| After Save (event) | **Return to timeline** automatically; if date changed, timeline re-sorts |
| Scale + orientation | Always visible in a top chrome bar on the timeline view |
| Import / export | Per open timeline (Settings or timeline menu); JSON |
| Import behavior | **Ask** merge into current **or** create new timeline (R11); conflicts by **id** only (R3) |
| Word / .docx export | Export event body as **.docx** (Word-compatible) |
| Month/Day focus | **Both:** type a year to jump + prev/next to step |
| Search | Within open timeline; title + body; filter + highlight |
| Event lifecycle | Full CRUD |
| Delete timeline / event | **Confirm** dialog before delete (R6) |
| Unsaved event edits | **Prompt** if navigating back with dirty form (R7) |
| Dashboard sort | **Updated recently** first (R12) |
| Event body format | **Plain text** MVP (R5) |
| Same-time UX | Proximity on axis only (R10) |

---

#### W0 — Dashboard (home)

```
┌─────────────────────────────────────────────────────────┐
│  Momentum                                               │
│  Your timelines                    [ + New timeline ]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Napoleonic Wars                                 │    │
│  │ 42 events · Updated yesterday                   │    │
│  │              [Open]  [Edit]  [Delete]           │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Novel: The Exile                                │    │
│  │ 18 events · Updated 3 days ago                  │    │
│  │              [Open]  [Edit]  [Delete]           │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Empty Dashboard:

```
│         No timelines yet                                │
│    Create one to start placing events in time           │
│              [ + New timeline ]                         │
```

Create / Edit timeline (simple form or modal):

```
│  Title *         [ Napoleonic Wars              ]       │
│  Description     [ Optional notes…              ]       │
│                    [ Cancel ]  [ Save ]                 │
```

---

#### W1 — Timeline (vertical, with events)

Opened from the dashboard. Chrome includes back to dashboard.

```
┌─────────────────────────────────────────────────────────┐
│  [ ← Dashboard ]  Napoleonic Wars      [Settings]       │
│  [ + Add event ]     Search: [ Napoleon____________ ]   │
│                                                         │
│  Scale: ( Year | Month | Day )     Orient: ( ↕ | ↔ )   │
│  Focus year: [ 1848 ]  [ ← prev ]  [ next → ]           │  ← month/day scales
├─────────────────────────────────────────────────────────┤
│                                                         │
│   1804 ──○── “Coronation”              ★ match          │
│          │                                              │
│   1812 ──○── “March on Moscow”         ★ match          │
│          │                                              │
│   1815 ──○── “Waterloo”                ★ match          │
│                                                         │
│   (non-matching events hidden while search is active)   │
└─────────────────────────────────────────────────────────┘
```

- Markers show **date + title** only
- Title is clickable → W4 Event detail
- **Search** matches against event **title and body** (body is searched even though not shown on the timeline)
- Example: query `Napoleon` matches any event whose body or title contains that text
- Matches are **highlighted** on the timeline; non-matches are **filtered out** (hidden) while the query is active
- Clear the search field to show the full timeline again
- At Month/Day scale, axis ticks become months or days; **Focus** row appears:
  - **Type a year** to jump the view to that year
  - **Prev / next** step through months (Month scale) or days (Day scale) within/around the focused year

---

#### W2 — Timeline (horizontal)

Same chrome; axis runs left → right.

```
┌─────────────────────────────────────────────────────────┐
│  [ ← Dashboard ]  Napoleonic Wars      [Settings]       │
│  [ + Add event ]     Search: [ ________________ ]       │
│  Scale: ( Year | Month | Day )     Orient: ( ↕ | ↔ )   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1847        1848              1849                     │
│   │           │                 │                       │
│   ○           ○──○              ○                       │
│   Harvest     Letter  Riot      Exile                   │
│                                                         │
│              (pan along the year axis)                  │
└─────────────────────────────────────────────────────────┘
```

---

#### W3 — Empty timeline (has timeline, zero events)

```
┌─────────────────────────────────────────────────────────┐
│  [ ← Dashboard ]  Novel: The Exile     [Settings]       │
│  Scale: ( Year | Month | Day )     Orient: ( ↕ | ↔ )   │
│  Search: [ ________________ ]                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              This timeline has no events yet            │
│     Add an event to place the first document in time    │
│                                                         │
│                   [ + Add event ]                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

#### W4 — Event detail (document)

Full-screen document. Back returns to timeline.

```
┌─────────────────────────────────────────────────────────┐
│  [ ← Timeline ]              [Export .docx] [Delete] [Save] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Title                                                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Letter from Claudia                               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Year *          Month (opt)      Day (opt)             │
│  ┌─────────┐     ┌─────────┐      ┌─────────┐           │
│  │ 1848    │     │ 3       │      │ 12      │           │
│  └─────────┘     └─────────┘      └─────────┘           │
│  (typed integers — not a datepicker)                    │
│                                                         │
│  Body                                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │  She writes that the roads are closed…            │  │
│  │                                                   │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Save → writes locally, then returns to the timeline    │
│  If date changed → timeline re-sorts into new order     │
└─────────────────────────────────────────────────────────┘
```

- **Edit:** any existing event is fully editable via this screen (title, date fields, body)
- **New event:** same layout; title empty; Save creates then returns to timeline; ← cancels/discards
- Year required; month/day optional
- Body is the document; never shown on W1/W2
- **Export .docx:** downloads this event’s document in a Word-compatible file (title + body; date metadata included when practical)
- **Date change:** after Save, markers on W1/W2 rearrange automatically by year → month → day so chronology stays correct

---

#### W5 — Settings / Data (import & export)

```
┌─────────────────────────────────────────────────────────┐
│  [ ← Timeline ]   Settings                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Appearance                                             │
│    Default orientation: ( Vertical | Horizontal )       │
│    (also changeable from timeline chrome)               │
│                                                         │
│  Data                                                   │
│    This timeline                                        │
│    [ Export timeline… ]   → JSON (timeline + events)    │
│    [ Import… ] → ask: merge into this timeline OR create new │
│                                                         │
│    Word export                                          │
│    Single-event .docx export is on the event detail     │
│    screen.                                              │
│                                                         │
│    If an imported event conflicts with an existing one, │
│    Momentum asks which to keep:                         │
│                                                         │
│    ┌─ Conflict: “Letter from Claudia” (1848) ─────────┐ │
│    │  [ Keep existing ]  [ Overwrite with imported ]  │ │
│    │  [ Apply to all remaining… ]  (optional later)   │ │
│    └──────────────────────────────────────────────────┘ │
│                                                         │
│  About                                                  │
│    Momentum — local Dashboard; multiple timelines;      │
│    data stays on this device                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

#### Navigation map

```
W0 Dashboard  ←→  W1/W2 Timeline view  ←→  W4 Event detail
                    ↕
                  W5 Settings (import/export for this timeline, prefs)
W3 = W1 with no events
Create/Edit timeline forms live on or from W0
```

#### Wireframe open points

_All wireframe decisions for MVP are locked (including multi-timeline + dashboard)._

1. ~~At Month scale, Focus: typed year vs prev/next?~~ → **Locked:** both
2. ~~Import default: Replace or Merge?~~ → **Locked:** merge into target timeline; conflict keep/overwrite
3. ~~After Save on detail: stay or return?~~ → **Locked:** return to timeline; date edits re-sort
4. ~~Search scope?~~ → **Locked:** title + body within open timeline; filter + highlight
5. ~~Single vs multiple timelines?~~ → **Locked:** multiple timelines + dashboard + full timeline CRUD

#### Timeline CRUD (locked — full)

| Operation | How |
|-----------|-----|
| **Create** | Dashboard **New timeline** → title (required) + optional description → Save → appears on dashboard |
| **Read** | Dashboard lists timelines; **Open** enters chronological view |
| **Update** | Dashboard **Edit** → change title/description → Save |
| **Delete** | Dashboard **Delete** → confirm → timeline and all its events removed |

#### Event CRUD (locked — full)

Momentum supports **full CRUD** for events **within a timeline**:

| Operation | How |
|-----------|-----|
| **Create** | Timeline **Add event** → detail (new) → Save → return to that timeline (sorted in) |
| **Read** | Timeline shows title + date; click title → detail shows full document |
| **Update** | Open detail → edit fields → Save → return to timeline; date changes re-sort |
| **Delete** | Open detail → **Delete** → event removed from that timeline |

Events always belong to exactly one `timelineId`. Deleting a timeline cascade-deletes its events.

#### Editing & chronological order (locked)

- Every event is **editable** (title, year, month, day, body) from the detail view
- Saving always returns to the parent timeline view
- If any date field changed, that timeline **re-sorts and rearranges** markers by chronology (`year`, then `month`, then `day`)
- No manual “reorder” step—order is always derived from dates

#### Focus navigation (locked)

- Shown when scale is **Month** or **Day**
- Focus cursor = **year + month + day** as needed (R4)
- **Typed year field:** jump focus to that year (keep month/day when sensible, or reset month/day to 1)
- **Prev / next:**
  - Month scale → step one **month**
  - Day scale → step one **day**
- Typing a year and stepping with prev/next stay in sync with the visible axis

#### Search (locked)

- Search field lives on the **timeline** chrome (with Add event / scale / orientation)
- Query matches **title and body** (case-insensitive substring is fine for MVP)
- Example: searching `Napoleon` includes any event whose body or title contains “Napoleon”
- While a query is active:
  - Matching events remain on the timeline and are **highlighted**
  - Non-matching events are **filtered out** (hidden)
- Clearing search restores the full timeline
- Opening a match still goes to detail for the full document
- Search does not change stored data—view filter only

#### Import conflict rules (locked)

- On import, **ask** whether to **merge into the current timeline** or **create a new timeline** from the file (R11)
- If merging: import **merges** into that timeline (does not wipe it; does not affect other timelines)
- If creating new: create timeline from file metadata (or prompt for title) and add all events
- **Conflict identity:** match on stable **`id` only**; if an imported event has no `id`, treat it as a **new** event (R3)
- On each id conflict, user chooses **Keep existing** or **Overwrite with imported**
- Non-conflicting imported events are added with the target `timelineId`
- Optional later: “apply to all remaining conflicts”

#### Event Word export (locked)

- Users can export an event as **`.docx`** from the event detail screen
- Timeline backup: **JSON** import/export for one timeline (metadata + its events)
- Optional later: bulk `.docx`; Dashboard-level JSON (all timelines)

---

## Technical approach (locked)

MVP stack — local web app, no backend, no Electron, no Firebase for v1.

| Layer | Choice | Notes |
|-------|--------|-------|
| Bundler / app | **Vite** + **React** + **TypeScript** | SPA; Next.js skipped as overkill for local-only |
| Routing | React Router | Dashboard, timeline view, event detail, settings |
| Styling | Tailwind + CSS variables | Fast iteration; brand tokens for look |
| Local DB | **Dexie** (IndexedDB) | Tables: `timelines`, `events` |
| Data access | `timelineRepository` + `eventRepository` | UI never talks to Dexie directly — cloud migration later |
| Validation | Zod | `Timeline`, `Event`, import payload |
| Timeline backup | **JSON** import/export (per timeline) | Merge + conflict prompts within target timeline |
| Word / .docx export | `docx` library → `.docx` | Single-event Word-compatible download |
| Testing | Vitest + Testing Library | |
| Deploy | Static host — **Cloudflare Pages** (R9; Netlify/GitHub Pages also fine) | App shell only; data stays in the browser |
| UI prefs | **`localStorage`** for scale + orientation (R8) | Event/timeline data stays in Dexie |
| Explicitly out of MVP | Next.js, Electron, Firebase/cloud sync, CSV as primary format | PWA / Tauri / Firebase / CSV optional later |

### Why this stack

- Product is 100% client-side → Vite SPA fits better than Next.js
- Dexie gives ergonomic CRUD on IndexedDB without a backend
- JSON preserves full events + ids for reliable merge/conflicts (CSV parked for later if needed)
- Repository pattern means a future Firebase (or other cloud) backend can replace Dexie without rewriting UI

### Suggested architecture (web MVP)

```
src/
  pages/ or routes/    # dashboard, timeline/:id, event detail, settings
  components/          # Dashboard, TimelineList, TimelineView, ScaleControl, SearchField, …
  data/                # dexie db, timelineRepository, eventRepository
  lib/                 # import/export JSON, docx, search, year helpers, scale helpers, validation
  types/               # Timeline, Event, Scale, ExportPayload
```

### Data flow (Dexie + JSON)

1. UI → `timelineRepository` / `eventRepository` → **Dexie** (`timelines`, `events` with `timelineId`)
2. **Export:** serialize one timeline + its events to JSON
3. **Import:** merge events into a chosen/open timeline; conflicts prompt keep vs overwrite
4. **`.docx` export:** one event’s title/body (and date fields)
5. Delete timeline → cascade delete events with that `timelineId`
6. No cloud API in MVP; Firebase later can map **Dashboard** → user account

### JSON export shape (sketch)

```json
{
  "version": 1,
  "exportedAt": "2026-09-24T00:00:00.000Z",
  "timeline": {
    "id": "…",
    "title": "Napoleonic Wars",
    "description": "Optional"
  },
  "events": [
    {
      "id": "…",
      "title": "Waterloo",
      "body": "…",
      "year": 1815,
      "month": 6,
      "day": 18
    }
  ]
}
```

Note: On import, user chooses merge-into-current vs create-new timeline (R11). Merged events get the target `timelineId`. Conflicts match on `id` only (R3).

### Implementation notes (time + UX locks)

- Store `year` as an integer (not a JS `Date` for the event’s chronology)—avoids epoch limits and timezone noise
- Do **not** use native date pickers as the primary year control
- Validate month/day only when provided; never reject a year for being “too old” or “too far”
- Sort: `year`, then `month` (missing month **after** dated months in that year), then `day` (missing day **after** dated days) — R2
- Year-only events at Month/Day scale: display at month 1 / day 1 + year-only cue — R1
- Focus cursor includes year/month/day as required for the active scale — R4
- After any create/update/delete, the timeline view re-reads sorted events—**date edits move the marker**
- Timeline render takes `(events, scale, focusRange, searchQuery)` — title + date markers only; search filter/highlight in the view layer
- Search scans `title` and `body` locally
- Detail: plain-text body; **confirm** delete; **prompt** on back if unsaved (R5–R7)
- Dashboard lists timelines by `updatedAt` descending (R12)
- Confirm timeline delete with event count (R6)

### Implementation decisions (R1–R12) — locked

Accepted leans:

| # | Decision |
|---|----------|
| **R1** | Year-only events at Month/Day scale → place at **month 1 / day 1** with a subtle **year-only** cue |
| **R2** | Missing month/day sort **after** more-specific dates in the same year/month |
| **R3** | Import conflicts match on **`id` only**; no id → treat as **new** event |
| **R4** | Focus = **year + month + day** as needed; year field jumps year; prev/next steps month or day by scale |
| **R5** | Event body is **plain text** in MVP |
| **R6** | **Confirm** before deleting a timeline or an event |
| **R7** | **Prompt** if leaving event detail with unsaved changes |
| **R8** | Scale/orientation prefs in **`localStorage`**; timelines/events in Dexie |
| **R9** | Default deploy target **Cloudflare Pages** (alternatives OK) |
| **R10** | Same-time visibility = **proximity on the axis** (no swimlanes in MVP) |
| **R11** | On JSON import, **ask**: merge into current timeline **or** create a new timeline |
| **R12** | Dashboard sort: **updated recently** first |

---

## Milestones

### Phase 0 — Align (this doc)
- [x] Clarify audience: writers + history learners
- [x] Lock time model: free-form year entry (any integer); optional month/day
- [x] Lock UX direction: events as dated entries; timeline shows title+date; click opens detail; year/month/day scale
- [x] Lock orientation: user-selectable vertical or horizontal
- [x] Lock v1 scale: explicit Year/Month/Day; continuous zoom planned later
- [x] Lock data: local-only persistence + JSON import/export (no cloud)
- [x] Lock wireframes (screens, save→timeline, merge conflicts, .docx, focus jump + prev/next, content search)
- [x] Lock stack: Vite + React + TypeScript + Dexie + JSON (+ Tailwind, Zod, docx)
- [x] Lock multi-timeline: Dashboard (account stand-in) + full timeline CRUD; events belong to a timeline
- [x] Lock implementation leans R1–R12 (placement, sort, import, focus, plain text, confirms, prefs, host, etc.)

### Phase 1 — Foundation
- [x] Scaffold Vite + React + TypeScript + Tailwind
- [x] Define `Timeline` + `Event` types (`timelineId` on events) with Zod; plain-text body
- [x] Year/month/day validation + sort helpers (R1/R2)
- [x] Dexie schema: `timelines`, `events` + repositories CRUD
- [x] Persist scale/orientation in `localStorage` (R8)
- [x] Dashboard shell (list by updatedAt desc — R12; empty state; new timeline)
- [x] Timeline view shell + scale control + orientation toggle + search field

### Phase 2 — MVP timelines + events
- [x] Timeline CRUD on dashboard (create, open, update, delete with confirm + cascade — R6)
- [x] Create / edit / delete event (detail view); Save returns to parent timeline; dirty-back prompt (R7)
- [x] On date edit, timeline re-sorts (R2); year-only / unknown-month display refined (see UX refinements)
- [x] Timeline markers: title + date only; title opens detail; proximity for concurrency (R10)
- [x] Explicit scale modes: Year / Month / Day
- [x] Focus controls: year jump + prev/next with year/month/day cursor (R4)
- [x] Vertical and horizontal layouts driven by user preference
- [x] Search by title + body within open timeline; filter + highlight
- [x] Export/import JSON: ask merge vs new timeline (R11); conflicts by id only (R3)
- [x] Export single event as `.docx` from detail
- [x] Basic responsive layout
- [x] Impossible calendar days rejected on save (e.g. 30 Feb); invalid stored events purged on load
- [x] First UI polish pass (gold/neutral theme, Manrope, year grouping, vertical year circles)
### Phase 3 — Polish
- [ ] Threads or tags for parallel strands
- [ ] Year-range filter / jump refinements
- [ ] Keyboard shortcuts for add / scale / search
- [ ] Empty, loading, and error states
- [ ] “Apply to all remaining conflicts” on import; bulk `.docx` / Markdown export

### Phase 4 — Stretch
- [ ] Continuous zoom / pan control (in addition to explicit Year/Month/Day)
- [ ] Display eras (BCE/CE) and optional calendar labeling
- [ ] Images, maps, reference links
- [ ] Dashboard-level JSON export/import (all timelines)
- [ ] Optional cloud sync / Firebase behind same repositories (Dashboard → account across devices)
- [ ] PWA / offline install
- [ ] Optional CSV export/import for date+title spreadsheets
- [ ] Desktop shell (Tauri) if native install is needed later

---

## Success criteria (MVP)

- User can create, open, rename, and delete multiple timelines from a dashboard
- Deleting a timeline removes its events
- Timeline view shows only titles and dates; body is visible only in detail view
- Clicking a title opens the corresponding event document
- User can switch among year, month, and day via an explicit control and see the axis update
- At month/day scale, user can type a year to jump and use prev/next to step
- User can switch between vertical and horizontal orientation; preference persists
- Data persists locally across refresh with no account
- User can export/import a timeline as JSON (ask merge vs new; id conflicts: keep/overwrite)
- Deletes of timelines/events require confirmation; unsaved event edits prompt on back
- Dashboard lists timelines with most recently updated first
- Year-only events appear at month 1 / day 1 for placement when zoomed in (R1); in the year list UI they group under **sometime this year** when the year has multiple events
- Saving an event returns the user to its timeline
- Editing an event’s date moves it to the correct place on that timeline automatically
- Search by content (title + body) within a timeline filters and highlights matches
- Can add events in widely different years (e.g. −44, 1066, 2145) and see them ordered correctly
- Year is entered by typing—not blocked by a modern datepicker range
- Impossible days (e.g. 30 Feb) cannot be saved
- Can add 20+ events across timelines and browse without lag
- Create/edit/delete works reliably after refresh for both timelines and events
- Dashboard and timeline remain readable on mobile width
- Someone new can create a timeline and add a first event in under a minute

---

## UX refinements (locked 2026-09-25)

Display and interaction details implemented during the first build pass:

| Topic | Decision |
|-------|----------|
| Storage | Dexie/IndexedDB is the source of truth; portable files only via JSON / `.docx` export |
| Date display order | **Year → month → day** (e.g. `1815 Jun 18`) |
| Month labels | Abbreviations (`Jan`…`Dec`), not zero-padded numbers |
| Same-year grouping | Show the **year once**; list events under it |
| Unknown month | If the year has **more than one** event, unknown-month events sit under an **h3 “sometime this year”** + `ul`, listed **above** dated events in that year |
| Single unknown-month event | No “sometime this year” heading; event sits under the year alone |
| Vertical year marker | Year number in an **opaque circle** on the axis; the axis line runs behind and is masked by the circle |
| Calendar validation | Reject impossible days on save; purge invalid stored events on dashboard/timeline load |
| Dashboard actions | Open / Edit / Delete as **icon buttons** (with aria-labels) |
| Visual direction | Gold + stone neutrals; **Manrope** sans-serif throughout |
| Routing | Data router (`createBrowserRouter`); unsaved leave uses `beforeunload` + confirm (not `useBlocker` alone) |

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Scope creep into full writing or LMS tools | Strict MVP; park manuscript/classroom features |
| Dual audience dilutes UX | Shared core (timeline + events + scale); templates later |
| Supporting two orientations doubles layout work | Shared marker/data layer; separate axis layout only |
| Continuous zoom sneaks into MVP | Explicit Year/Month/Day only in v1; zoom listed in Phase 4 |
| Year-only events at day scale | R1: place at month 1 / day 1 + year-only cue |
| Accidental use of `Date` / datepicker limits years | Integer `year` field; custom inputs; tests for extreme years |
| Ambiguous year 0 / BCE display | Sort on signed integers; defer era labeling to Phase 4 |
| Local data loss (cleared storage, new device) | First-class export/import; prompt users to back up |
| Search misses body-only matches | Explicitly index/scan both title and body; test with body-only keywords |
| Partial dates sort ambiguity | R2 locked: incomplete dates after more-specific ones |
| Cascade delete mistakes | R6: confirm “Delete timeline and all N events?” |
| Dual orientation scope | Shared data layer; ship vertical first if timeline slips, horizontal immediately after |
| Generic UI | Design pass before Phase 2 polish; brand-led first viewport |

---

## Next steps

1. Continue manual QA and small UX fixes (see [`DEVELOPMENT.md`](./DEVELOPMENT.md)).
2. Deploy the static Vite build (Cloudflare Pages or equivalent).
3. Only then pick Phase 3 / Phase 4 items deliberately.

Track day-to-day build progress in [`DEVELOPMENT.md`](./DEVELOPMENT.md).

---

## Notes / parking lot

_Ideas that are interesting but not committed:_

- Character / faction swimlanes as a dedicated layout
- Compare two historical periods side by side
- CSV import/export for lightweight date + title spreadsheets (JSON remains canonical)
- Import from Markdown outlines
- Citation fields for history sources
- Chapter or arc markers overlaid on the timeline
- Custom era names mapped onto numeric years
- Preview snippet on hover (still not full body on timeline)
- Continuous zoom/pan refinements beyond the Phase 4 baseline
- Firebase / cloud sync behind `eventRepository` if multi-device without files becomes important
- PWA installability
- Tauri (or Electron) desktop shell — skipped for MVP
- Private encrypted vault mode
