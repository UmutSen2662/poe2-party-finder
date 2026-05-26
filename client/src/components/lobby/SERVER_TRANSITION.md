# Lobby Server Transition Notes

This document outlines how to replace the current Lobby mock state/data with real server-backed state once the API routes are ready.

## Current Client Pattern To Follow

The existing search page (`client/src/pages/search-page.tsx`) is the reference pattern. Follow this exact structure:

**Query Definitions (Top-Level)**
```ts
const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await api.categories.get();
    if (error) throw error;
    return data;
  },
});
```

**Component-Level Data Fetching**
```ts
const { data: categories } = useSuspenseQuery(categoriesQuery);
```

**Data Normalization**
```ts
const filterCategories = categories.map((category) => ({
  id: category.id,
  displayName: category.name,
}));
```

**Asset URL Handling**
```ts
currency={{
  name: party.currency.name,
  icon: assetUrl(party.currency.icon),
}}
```

For Lobby, follow this exact pattern: define query options at the top level, fetch data in the page component, normalize with direct computation before passing to UI components, and use `assetUrl()` for all server-provided image paths.

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
  - uses a dev state switcher (`ViewSwitcher`) to manually toggle between views.

When server routes exist, remove or shrink `mock-data.ts` and replace the page-local state with query/mutation results. The view should be determined by server state, not manual switching.

## Required Server Data

Lobby needs one authoritative endpoint/query that resolves the current player's lobby state, following the same pattern as search-page's lookup queries.

### Primary Lobby State Query

**Server Endpoint:** `GET /lobby/state` (or similar)

**Query Definition:**
```ts
const lobbyStateQuery = queryOptions({
  queryKey: ["lobby", "state"],
  queryFn: async () => {
    const { data, error } = await api.lobby.state.get();
    if (error) throw error;
    return data;
  },
});
```

**Expected Response Shape:**
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

### Lookup Data Queries

Follow the exact pattern from search-page for all lookup data:

```ts
const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await api.categories.get();
    if (error) throw error;
    return data;
  },
});

const leaguesQuery = queryOptions({
  queryKey: ["leagues", { activeOnly: true }],
  queryFn: async () => {
    const { data, error } = await api.leagues.get({
      $query: { activeOnly: true },
    });
    if (error) throw error;
    return data;
  },
});

const currenciesQuery = queryOptions({
  queryKey: ["currencies"],
  queryFn: async () => {
    const { data, error } = await api.currencies.get();
    if (error) throw error;
    return data;
  },
});
```

## Additional Queries To Add

Following the search-page pattern, define query options at the top level of the file:

### Templates Query
```ts
const templatesQuery = queryOptions({
  queryKey: ["lobby", "templates"],
  queryFn: async () => {
    const { data, error } = await api.lobby.templates.get();
    if (error) throw error;
    return data;
  },
});
```

### Applicants Query (Host Only)
```ts
function applicantsQuery(partyId: number) {
  return queryOptions({
    queryKey: ["lobby", "applicants", partyId],
    queryFn: async () => {
      const { data, error } = await api.lobby.applicants.get({
        $query: { partyId },
      });
      if (error) throw error;
      return data;
    },
  });
}
```

### Party Members Query (For Rating Flows)
```ts
function partyMembersQuery(partyId: number) {
  return queryOptions({
    queryKey: ["lobby", "party-members", partyId],
    queryFn: async () => {
      const { data, error } = await api.lobby["party-members"].get({
        $query: { partyId },
      });
      if (error) throw error;
      return data;
    },
  });
}
```

**Important:** All query definitions must follow the exact error pattern from search-page:
```ts
const { data, error } = await api.someRoute.get();
if (error) throw error;
return data;
```

## Mutations To Add

Replace local button handlers with TanStack Query mutations. Use `useMutation` from `@tanstack/react-query` and follow this pattern:

```ts
const queryClient = useQueryClient();

const createPartyMutation = useMutation({
  mutationFn: async (payload: CreatePartyPayload) => {
    const { data, error } = await api.parties.post(payload);
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["lobby", "state"] });
    queryClient.invalidateQueries({ queryKey: ["parties"] });
  },
});
```

### Required Mutations

**Create Party**
- Sends `title`, `description`, `capacity`, `cost`, `league_id`, `category_id`, `currency_id`.
- Server attaches `host_id` from auth/session.
- Server sets `status = 'Gathering'`.
- Server lets PostgreSQL handle `created_at`.
- Invalidate `["lobby", "state"]` and `["parties"]` queries.

**Save Template**
- Sends the current form payload as JSON.
- Server updates the player's `templates` JSONB array.
- Invalidate `["lobby", "templates"]` and possibly `["lobby", "state"]`.

**Cancel Application**
- Deletes the current player's `Applies` row only if party status is still `Gathering`.
- Invalidate `["lobby", "state"]` and affected party/applicant queries.

**Copy Whisper**
- Prefer a server endpoint that returns the final TFT-compliant whisper string.
- Client copies the returned string with `navigator.clipboard.writeText(...)`.

**Start Party**
- Updates `Party.status` to `Started`.
- Keep the confirmation dialog.
- Invalidate `["lobby", "state"]`, `["parties"]`, and title-bar session data later.

**End Party**
- Updates `Party.status` to `Ended`.
- Opens rating UI after mutation success.
- Invalidate `["lobby", "state"]`.

**Cancel Lobby**
- Deletes/cancels the active lobby before starting.
- Keep the confirmation dialog.
- Invalidate `["lobby", "state"]` and `["parties"]`.

**Applicant Actions**
- Accept / Reject / Kick update `Applies.status`.
- Invalidate `["lobby", "applicants", partyId]` and `["lobby", "state"]`.

**Ratings**
- Host rates accepted/kicked customers after ending a run.
- Customer rates host after the run ends.
- Insert rows into `Rating` table.
- Invalidate profile/rating summaries when those exist.

## Component Wiring Plan

Following the search-page pattern, keep view components mostly presentational and handle all server interaction in the page component:

**Keep UI-Only:**
- `create-party-view.tsx` - receives form state and callbacks as props
- `customer-lobby-view.tsx` - receives application data and callbacks as props
- `host-lobby-view.tsx` - receives party data, applicants, and callbacks as props

**Server Interaction in LobbyPage:**
- Define all query options at the top level (like search-page)
- Use `useSuspenseQuery` for lookup data (categories, leagues, currencies)
- Use `useQuery` for conditional data (lobby state, applicants)
- Use `useMutation` for all write operations
- Normalize data with direct computation before passing to child components
- Use `assetUrl()` for all server-provided image paths

**Example Pattern:**
```ts
export function LobbyPage() {
  const queryClient = useQueryClient();

  // Lookup data (always fetched)
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: leagues } = useSuspenseQuery(leaguesQuery);
  const { data: currencies } = useSuspenseQuery(currenciesQuery);

  // Lobby state (determines which view to show)
  const { data: lobbyState } = useQuery(lobbyStateQuery);

  // Normalize data for components
  const filterCategories = categories.map((category) => ({
    id: category.id,
    displayName: category.name,
  }));

  // Mutations
  const createPartyMutation = useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await api.parties.post(payload);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", "state"] });
    },
  });

  // Render based on lobbyState.kind instead of manual switcher
  if (!lobbyState) return <Loading />;
  if (lobbyState.kind === "empty") return <CreatePartyView />;
  if (lobbyState.kind === "customer") return <CustomerLobbyView />;
  if (lobbyState.kind === "host") return <HostLobbyView />;
}
```

**Do NOT extract custom hooks initially.** Follow the search-page pattern of keeping everything in the page component until the API stabilizes, then consider extraction if needed.

## Lookup Mapping Notes

Following the search-page pattern, normalize all lookup data with direct computation before passing to components:

```ts
const filterCategories = categories.map((category) => ({
  id: category.id,
  displayName: category.name,
}));

const filterLeagues = leagues.map((league) => ({
  id: league.id,
  displayName: league.name,
}));

const filterCurrencies = currencies.map((currency) => ({
  id: currency.id,
  name: currency.name,
  icon: assetUrl(currency.icon),
}));
```

**Server Requirements:**
- Leagues: server must return only `status = 'Active'` / active equivalent (use `$query: { activeOnly: true }` like search-page)
- Categories: server must return only active categories
- Currencies: return `id`, `name`, and icon/image field when available

**Asset Handling:**
- Always use `assetUrl()` for server-provided image paths
- Do not hard-code fallback styling based on heuristics (e.g., "if name contains 'divine' use amber")
- If the server has no icon, render no icon (don't create client-side fallbacks)

## State Switcher Removal

The current dev state switcher (`ViewSwitcher`) in `LobbyPage` is temporary and must be removed.

When `GET /lobby/state` exists:

1. **Remove the manual `view` state** - no more `useState<LobbyView>("create")`
2. **Remove the `ViewSwitcher` component** entirely
3. **Render based on `lobbyState.kind`**:
   ```ts
   if (lobbyState.kind === "empty") {
     return <CreatePartyView {...props} />;
   }
   if (lobbyState.kind === "customer") {
     return <CustomerLobbyView {...props} />;
   }
   if (lobbyState.kind === "host") {
     return <HostLobbyView {...props} />;
   }
   ```
4. **Remove dev status badges** - the party status should come from server data, not local state
5. **Keep a small dev override only if absolutely needed**, but hide it behind an explicit development flag (e.g., `if (import.meta.env.DEV) ...`)

The view should be entirely server-driven, just like how search-page is entirely filter-driven.

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

Following the search-page integration pattern, implement in this order:

### Phase 1: Lookup Data (Foundation)
1. **Add server endpoints** for active lookup data (if not already present):
   - `GET /categories` (active only)
   - `GET /leagues` with `$query: { activeOnly: true }`
   - `GET /currencies`
2. **Define query options** at the top of `lobby-page.tsx` following the exact pattern from search-page
3. **Replace mock imports** with `useSuspenseQuery` for categories, leagues, and currencies
4. **Normalize data** with direct computation and pass to child components
5. **Use `assetUrl()`** for all currency/category icons

### Phase 2: Lobby State (View Determination)
6. **Add server endpoint** `GET /lobby/state` that returns the current player's lobby state
7. **Define `lobbyStateQuery`** using `queryOptions` pattern
8. **Replace dev state switcher** with conditional rendering based on `lobbyState.kind`
9. **Remove `ViewSwitcher` component** and manual `view` state
10. **Remove dev status badges** - use server-provided status instead

### Phase 3: Create Party Flow
11. **Add server endpoint** `POST /parties` for creating parties
12. **Define `createPartyMutation`** using `useMutation` pattern
13. **Replace local form state** with mutation callback in `CreatePartyView`
14. **Invalidate queries** on success: `["lobby", "state"]` and `["parties"]`

### Phase 4: Template System
15. **Add server endpoints** for templates:
   - `GET /lobby/templates` (fetch current player's templates)
   - `POST /lobby/templates` (save new template)
   - `DELETE /lobby/templates/:id` (delete template)
16. **Define `templatesQuery`** and template mutations
17. **Replace local template state** with query/mutation results
18. **Invalidate `["lobby", "templates"]`** after save/delete operations

### Phase 5: Host Lobby Flow
19. **Add server endpoints** for host operations:
   - `GET /lobby/applicants?partyId=:id`
   - `PATCH /lobby/applicants/:id` (accept/reject/kick)
   - `PATCH /parties/:id/status` (start/end party)
20. **Define `applicantsQuery`** (parameterized by partyId)
21. **Define applicant action mutations** (accept/reject/kick)
22. **Define party status mutations** (start/end/cancel)
23. **Replace local applicant state** with query results
24. **Replace local party status** with server data
25. **Keep confirmation dialogs** for destructive actions (start/end/cancel)

### Phase 6: Customer Lobby Flow
26. **Add server endpoints** for customer operations:
   - `POST /parties/:id/apply` (apply to party)
   - `DELETE /applies/:id` (cancel application)
   - `GET /lobby/whisper/:partyId` (generate whisper string)
27. **Define application mutations** (apply/cancel)
28. **Replace local application status** with server data
29. **Implement whisper copy** using server-generated string

### Phase 7: Rating System
30. **Add server endpoints** for ratings:
   - `POST /ratings` (submit rating)
   - `GET /players/:id/ratings` (fetch rating history)
31. **Define rating mutations** for host and customer flows
32. **Open rating UI** after party ends (mutation success)
33. **Invalidate rating queries** after submission

### Phase 8: Title-Bar Widget
34. **Add lightweight query** for active session summary (or reuse `["lobby", "state"]`)
35. **Implement title-bar widget** with compact session data
36. **Avoid duplicate fetches** - share query keys with lobby page

### Phase 9: Cleanup
37. **Delete `mock-data.ts`** entirely once all paths are server-backed
38. **Remove any remaining dev-only code** behind proper feature flags
39. **Verify all asset URLs** use `assetUrl()` helper
40. **Test all error states** and loading states

## Key Differences from Current Implementation

The current lobby implementation differs significantly from the search-page pattern. Here's what needs to change:

### Current Lobby (Wrong Pattern)
```ts
// ❌ Manual state management
const [view, setView] = useState<LobbyView>("create");
const [form, setForm] = useState<PartyFormState>(initialFormState);
const [templates, setTemplates] = useState<Template[]>(initialTemplates);
const [partyStatus, setPartyStatus] = useState<PartyStatus>("Gathering");

// ❌ Manual view switching
<ViewSwitcher view={view} setView={setView} />

// ❌ Dev status badges
<Badge className={statusBadgeClass(partyStatus)}>
  Party: {partyStatus}
</Badge>
```

### Target Lobby (Search-Page Pattern)
```ts
// ✅ Query options at top level
const lobbyStateQuery = queryOptions({
  queryKey: ["lobby", "state"],
  queryFn: async () => {
    const { data, error } = await api.lobby.state.get();
    if (error) throw error;
    return data;
  },
});

// ✅ Data fetching in component
const { data: lobbyState } = useQuery(lobbyStateQuery);

// ✅ Server-driven view rendering
if (lobbyState.kind === "empty") {
  return <CreatePartyView {...props} />;
}
if (lobbyState.kind === "customer") {
  return <CustomerLobbyView {...props} />;
}
if (lobbyState.kind === "host") {
  return <HostLobbyView {...props} />;
}

// ✅ Status from server data
<Badge>{lobbyState.party.status}</Badge>
```

### Specific Changes Required

1. **Remove `ViewSwitcher` component** - view should be determined by `lobbyState.kind`
2. **Remove manual `view` state** - no more `useState<LobbyView>("create")`
3. **Remove mock data imports** - replace with query results
4. **Remove local form/template state** - replace with query/mutation results
5. **Remove dev status badges** - use server-provided status
6. **Add query options** at top level following search-page pattern
7. **Add `useSuspenseQuery`** for lookup data (categories, leagues, currencies)
8. **Add `useQuery`** for conditional data (lobby state, applicants)
9. **Add `useMutation`** for all write operations
10. **Add direct computation** for data normalization before passing to components
11. **Add `assetUrl()`** for all server-provided image paths
12. **Add proper query invalidation** in mutation success callbacks

## Keep In Mind

### Security & Data Flow
- **Never let the frontend send trusted fields** like `host_id`, `created_at`, or final rating ownership fields
- **Server should attach current `Player.id`** from auth/session, not from request body
- **Frontend prepares form payloads only** - server validates and attaches ownership

### Query & Mutation Patterns (Follow Search-Page Exactly)
- **Define query options at the top level** using `queryOptions({...})`
- **Use `useSuspenseQuery` for required data** (categories, leagues, currencies)
- **Use `useQuery` for conditional data** (lobby state, applicants - enabled when needed)
- **Use `useMutation` for all write operations** with proper error handling
- **Always check for error in response**: `if (error) throw error;`
- **Invalidate queries after mutations** instead of manually patching local state
- **Use `queryClient.invalidateQueries({ queryKey: [...] })`** for cache invalidation

### Asset Handling
- **Always use `assetUrl()`** for server-provided image paths (categories, currencies, etc.)
- **Never hard-code fallback styling** based on string heuristics
- **If server has no icon, render no icon** - don't create client-side fallbacks

### UI Patterns
- **Keep confirmation dialogs** for destructive actions (Start, End, Cancel) even after real mutations
- **Normalize data with direct computation** before passing to child components (no `useMemo` needed in React 19)
- **Keep view components presentational** - all server interaction in the page component
- **Don't extract custom hooks initially** - follow search-page pattern until API stabilizes

### Type Safety
- **Avoid duplicating enum strings** in multiple places once server types are available through Eden
- **Use server-generated types** from Eden treaty for all API responses
- **Define local types only for UI-specific shapes** (like normalized filter objects)

### Error Handling
- **Follow search-page error pattern**: check for error in response, throw if present
- **Let React Query handle loading/error states** - don't manually manage loading flags
- **Use proper error boundaries** for query failures
