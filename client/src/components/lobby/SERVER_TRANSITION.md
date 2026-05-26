# Lobby Server Transition Notes

This document outlines how to replace the current Lobby mock state/data with real server-backed state once the API routes are ready.

## Current Client Pattern To Follow

The existing search page is the reference pattern:

- `client/src/lib/eden.ts` exports the Eden API client:
  - `api = edenTreaty<App>("http://localhost:3000")`
- `client/src/lib/queryClient.ts` exports the app-wide TanStack `QueryClient`.
- `client/src/pages/search-page.tsx` uses:
  - `queryOptions(...)`
  - `useSuspenseQuery(...)`
  - `api.categories.get()`
- Data is fetched in the page/shell and then normalized before passing into UI components.

For Lobby, keep the same direction: fetch/mutate in the shell or hooks, keep view components mostly presentational.

## Current Mock Files To Replace

The current mock sources are:

- `client/src/components/lobby/mock-data.ts`
  - `activeLeagues`
  - `activeCategories`
  - `currencies`
  - `initialFormState`
  - `initialTemplates`
  - `initialApplicants`
  - `applicationStatuses`
- `client/src/pages/lobby-page.tsx`
  - owns temporary `useState` for form, templates, party status, application status, and applicants.

When server routes exist, remove or shrink `mock-data.ts` and replace the page-local state with query/mutation results.

## Required Server Data

Lobby needs one authoritative endpoint/query that resolves the current player's lobby state.

Suggested shape:

```ts
type LobbyState =
  | { kind: "empty" }
  | { kind: "customer"; application: ApplicationWithParty }
  | { kind: "host"; party: HostedPartyWithApplicants };
```

The server should decide this from database state:

- **Empty:** current player is not hosting an active party and has no active application.
- **Customer:** current player has a row in `Applies` for an active party.
- **Host:** current player matches `Party.host_id` for an active party.

## Queries To Add

Add query helpers near the lobby feature or in a future `client/src/lib/queries` folder.

Recommended query keys:

- `['lobby', 'state']`
- `['lobby', 'lookups']`
- `['lobby', 'templates']`
- `['lobby', 'applicants', partyId]`

Recommended server-backed reads:

- **Lobby state:** current user's active lobby/application/empty state.
- **Active lookups:** active leagues, active categories, currencies.
- **Templates:** current player's templates JSONB array.
- **Applicants:** applicants for the hosted party, ordered by `applied_at`.
- **Party members:** accepted/kicked customers for display and rating flows.

Use the same error pattern as `SearchPage`:

```ts
const { data, error } = await api.someRoute.get();
if (error) throw error;
return data;
```

## Mutations To Add

Replace local button handlers with TanStack mutations that call Eden routes and then invalidate relevant query keys.

Recommended mutations:

- **Create party**
  - Sends `title`, `description`, `capacity`, `cost`, `league_id`, `category_id`, `currency_id`.
  - Server attaches `host_id` from auth/session.
  - Server sets `status = 'Gathering'`.
  - Server lets PostgreSQL handle `created_at`.
  - Invalidate `['lobby', 'state']` and live search queries.

- **Save template**
  - Sends the current form payload as JSON.
  - Server updates the player's `templates` JSONB array.
  - Invalidate `['lobby', 'templates']` and possibly `['lobby', 'state']`.

- **Cancel application**
  - Deletes the current player's `Applies` row only if party status is still `Gathering`.
  - Invalidate `['lobby', 'state']` and affected party/applicant queries.

- **Copy whisper**
  - Prefer a server endpoint that returns the final TFT-compliant whisper string.
  - Client copies the returned string with `navigator.clipboard.writeText(...)`.

- **Start party**
  - Updates `Party.status` to `Started`.
  - Keep the confirmation dialog.
  - Invalidate `['lobby', 'state']`, live search, and title-bar session data later.

- **End party**
  - Updates `Party.status` to `Ended`.
  - Opens rating UI after mutation success.
  - Invalidate `['lobby', 'state']`.

- **Cancel lobby**
  - Deletes/cancels the active lobby before starting.
  - Keep the confirmation dialog.
  - Invalidate `['lobby', 'state']` and live search.

- **Applicant actions**
  - Accept / Reject / Kick update `Applies.status`.
  - Invalidate `['lobby', 'applicants', partyId]` and `['lobby', 'state']`.

- **Ratings**
  - Host rates accepted/kicked customers after ending a run.
  - Customer rates host after the run ends.
  - Insert rows into `Rating` table.
  - Invalidate profile/rating summaries when those exist.

## Component Wiring Plan

Keep these components mostly UI-only:

- `create-party-view.tsx`
- `customer-lobby-view.tsx`
- `host-lobby-view.tsx`

Move server interaction into one of these patterns:

1. `LobbyPage` owns queries/mutations and passes props down.
2. A future `useLobbyState()` hook owns query state.
3. Smaller hooks own specific mutation groups, e.g. `useCreatePartyMutation()` or `useApplicantActions()`.

Recommended near-term approach: start with `LobbyPage` + small local query/mutation helpers, then extract hooks once the API stabilizes.

## Lookup Mapping Notes

The create form currently needs active relational records only:

- Leagues: server must return only `status = 'Active'` / active equivalent.
- Categories: server must return only active categories.
- Currencies: return `id`, `name`, and icon/image field when available.

The UI currently maps category styling locally. When real category icons/colors exist, add fields from the server or map by category id in one place only.

## State Switcher Removal

The current dev state switcher in `LobbyPage` is temporary.

When `GET current lobby state` exists:

- Remove manual `view` state.
- Render based on `lobbyState.kind`.
- Keep a small dev override only if needed, but hide it behind an explicit development flag.

## Title-Bar Widget Follow-Up

The title-bar active-session widget is intentionally not part of the current lobby mock cleanup.

When adding it later, avoid duplicating lobby fetches. Prefer a shared query key such as:

- `['lobby', 'state']`
- or a lighter `['session', 'activeLobbySummary']`

The widget only needs compact data:

- status, e.g. `Started`
- capacity, e.g. `3/5`
- maybe whether the player is host or customer

## Suggested Implementation Order

1. Add server endpoint for active lookup data.
2. Replace `activeLeagues`, `activeCategories`, and `currencies` mocks with a `useSuspenseQuery` lookup query.
3. Add current lobby-state endpoint and render by server state instead of dev switcher.
4. Replace create party local action with mutation.
5. Replace template modal actions with template query/mutation.
6. Replace host applicant queue with applicant query and mutations.
7. Replace customer application actions and whisper generation.
8. Add rating mutations for host and customer flows.
9. Add title-bar widget using shared lobby/session query data.
10. Delete remaining mock data once all paths are server-backed.

## Keep In Mind

- Do not let the frontend send trusted `host_id`, `created_at`, or final rating ownership fields.
- The frontend may prepare form payloads, but the server should attach current `Player.id` from auth/session.
- Keep confirmation dialogs for Start, End, and Cancel even after real mutations are connected.
- Invalidate queries after mutations instead of manually patching every piece of local UI state.
- Avoid duplicating enum strings in multiple places once server types are available through Eden.
