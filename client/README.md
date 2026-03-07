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
  - `pages/`: Page-level feature components like `search-page.tsx`, `posts-page.tsx`, and the `test-page.tsx` Markdown playground.
  - `app.tsx`: The primary application shell containing our bespoke `<TabPage>` component which implements routing via CSS display toggling to persist UI state.
  - `lib/`: Utility files including `eden.ts` which configures our **Eden client** for fully-typed backend communication.
- `src-tauri/` (The Rust Desktop Wrapper)
  - Contains `tauri.conf.json` and `src/main.rs`. Implements backend commands called by the React Titlebar to seamlessly control the OS window.
- `vite.config.ts`: Configures the frontend bundler, Tailwind v4 plugin, and TanStack router plugin.

---

## Frontend Tech Stack Deep Dive

1. **Routing & UI State:** We intentionally do not use a standard URL router (like TanStack Router or React Router). Desktop applications require complex background-task persistence (like our Live Search network requests). We use a custom `<TabPage>` wrapper in `app.tsx` that controls component lifecycle with CSS `display: none` or React 19 `<Activity>`. This perfectly preserves React state (search filters, inputs) and allows background `useEffect` polling to continue running uninterrupted while viewing other tabs.
2. **Data Fetching (Suspense & Queries):** We use `@tanstack/react-query` combined with React's native `<Suspense>`. We utilize `useSuspenseQuery` or standard `useQuery` inside our `pages/` to eliminate manual unhandled loading states. Our architecture dictates that reference data (e.g., categories) relies entirely on TanStack query caching.
3. **API Client:** We use the Eden client (`@elysiajs/eden`) to interact with our backend, providing end-to-end type safety directly from our server definitions without needing manual fetch calls.
4. **Styling:** We use Tailwind CSS v4. All theme variables, base styles, and Tailwind configurations are explicitly consolidated into `src/shadcn.css` which serves as the single source of truth for the application's design system, keeping global styles clean and conflicts to a minimum.
5. **Keyboard Navigation:** We use `@tanstack/react-hotkeys` to provide standard desktop shortcuts (e.g., `Ctrl+1` through `Ctrl+4` to navigate Sidebar tabs, and `Ctrl+Shift+D` for theme toggling). These shortcuts are visually reinforced using custom `<Kbd>` tooltip components.
