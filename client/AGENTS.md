# Client AGENTS.md

**AI Context**: React 19 + Tauri v2 + Tailwind v4 + ShadCN UI

## Architecture
- `src/App.tsx` - Tab-based routing (preserve state persistence model)
- Use CSS display toggling + React 19 `<Activity>` patterns
- TanStack Query for server state
- Eden client for API calls
- Theme variables in `shared/src/styles/theme.css`

## Required Patterns
- No URL router - use custom tab system
- Use `@/` path alias for `./src/` imports
- Use Lucide React for icons
- Run ShadCN CLI from client directory
- No global design tokens in this workspace

## Commands
- Dev server: `1420`
- Add components: `bunx shadcn@latest add <component>`

## API Client (`src/lib/eden.ts`)
- `api` — eden-treaty client typed against the server's `App`.
- `API_BASE_URL` — base URL constant (currently `http://localhost:3000`).
- `assetUrl(path)` — resolves a server-provided asset path (e.g.
  `/categories/images/foo.png`) to an absolute URL. Passes through absolute
  URLs and `null`/`undefined`. **Always pipe server-returned image/icon
  paths through `assetUrl` before handing them to `<img>` or `background-image`.**

## Server-Driven UI
Components must not hard-code data that lives on the server. In particular:
- Currency display (name, icon) — fetched from `/currencies`, rendered via
  `CurrencyBadge` which accepts a `{ name, icon }` object.
- Category visuals — fetched from `/categories`. The category artwork is
  the **ambient background** of `PartyCard`; if no image is set, fall back
  to the primary-color gradient (`from-primary/30 via-primary/10`).
- Leagues — fetched from `/leagues`; never list them inline in JSX.
- No fallback styling tones based on heuristics (e.g. "if name contains
  'divine' use amber"). If the server has no icon, render no icon.

## Search Page Pattern (`src/pages/search-page.tsx`)
Reference implementation for any list page backed by a filterable endpoint
plus an SSE stream.

- **Filters live in a single state object** (`SearchFilterState`). Fields use
  server-shaped ids (`number` / `null`), not display strings.
- **Server-side filtering only.** Every filter (`q`, price range, host rating,
  ids, etc.) maps to a query param on `/parties`. Do not post-filter the list
  on the client.
- **Click-to-search.** The query is keyed by a separate `submittedParams`
  state that only updates when the user presses the Search button — typing
  in the filter inputs does not refetch.
- **Live search opens an SSE stream** to `/parties/live` with the same query
  params. Toggling the switch on commits the current filters as a search
  *first*, then opens the stream. New `party.created` events are prepended
  into the React Query cache via `queryClient.setQueryData` (dedupe by id).
- **Per-party refresh** uses `GET /parties/:id` (which returns the full
  search-row shape) and patches just that entry in the cached list. On
  404/no-match, the entry is removed from the list and from the refresh map.

## Live Time and Staleness
- `src/lib/use-now.ts` exposes `useNow(intervalMs?)` (default 15s) and
  `formatRelativeTime(fromMs, now)` for "Xm ago" style labels.
- **Listing time** is server data (`createdAt`). Display it with
  `formatRelativeTime` and `useNow()` so the label updates on its own.
- **Staleness** is purely a client concern. Track per-item
  `lastRefreshedAt: number` (ms epoch). Cards compute `isStale` internally
  from `useNow()`. Refreshing one item only resets that item's timestamp;
  a full search resets all of them; SSE-inserted items get the current time.
- `PartyCard` enforces this: it takes `createdAt?` and `lastRefreshedAt?`
  and computes staleness internally. It does **not** accept `isStale`/
  `isFresh` flags from the outside.
