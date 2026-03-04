# Client Documentation (React + Tauri)

This workspace contains the frontend UI and the native desktop wrapper for the Path of Exile 2 Party Finder. 

## Prerequisites for Native Development

To run or build the Tauri desktop application, you must install the Rust compiler and OS-specific build dependencies.
- **Windows**: Install the Microsoft C++ Build Tools and the WebView2 SDK.
- **macOS / Linux**: Refer to the official [Tauri Prerequisites guide](https://v2.tauri.app/start/prerequisites/) for required packages.

## When to run commands in this folder
You **must** `cd client` before running certain specific frontend tooling commands.

### Adding Shadcn UI Components
If you want to add new Shadcn UI components, you **cannot** run the CLI tool from the monorepo root. You must be in this directory:

```bash
cd client
bunx shadcn@latest add dialog
```
*Note: We are using Tailwind CSS v4 and React 19.*

### Building the Desktop App
```bash
cd client
bun run tauri build
```
*(Alternatively, you can run `bun run build` from the monorepo root).*

---

## Detailed Directory Structure

- `src/` (The React Application)
  - `components/`: Our isolated, reusable UI layer using ShadCN UI. Includes extracted domain components like `search-filters.tsx` and `currency-badge.tsx`, as well as a native-like frameless `title-bar.tsx` and `app-sidebar.tsx`.
  - `routes/`: File-based routing powered by **TanStack Router**. `index.tsx` acts as the primary interactive dashboard. State is heavily driven by URL search parameters for persistence.
  - `lib/`: Utility files including `api.ts` which configures our **Eden client** for fully-typed backend communication.
- `src-tauri/` (The Rust Desktop Wrapper)
  - Contains `tauri.conf.json` and `src/main.rs`. Implements backend commands called by the React Titlebar to seamlessly control the OS window.
- `vite.config.ts`: Configures the frontend bundler, Tailwind v4 plugin, and TanStack router plugin.

---

## Frontend Tech Stack Deep Dive

1. **Routing & State:** We use `@tanstack/react-router` configured with `createMemoryHistory` to avoid browser URL bar issues in our Tauri desktop environment. Our complex filtering state (search queries, prices, categories, and live search locking) is managed entirely via URL search parameters, ensuring type safety and persistence across navigation.
2. **Data Fetching (Suspense & Loaders):** We use `@tanstack/react-query` perfectly integrated with TanStack Router. We define query options (`queryOptions()`) and execute them inside the route's `loader` via `queryClient.ensureQueryData`. This parallelizes the data fetch with the component download ("Render-as-you-fetch" pattern). We then rely on TanStack Router's `pendingComponent` and React Query's `useSuspenseQuery` inside our pages to completely eliminate manual `isLoading` checks.
3. **API Client:** We use the Eden client (`@elysiajs/eden`) to interact with our backend, providing end-to-end type safety directly from our server definitions without needing manual fetch calls.
4. **Styling:** We use Tailwind CSS v4. All theme variables, base styles, and Tailwind configurations are explicitly consolidated into `src/shadcn.css` which serves as the single source of truth for the application's design system, keeping global styles clean and conflicts to a minimum.
