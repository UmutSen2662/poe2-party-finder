# Client Documentation (React + Tauri)

This workspace contains the frontend UI and the native desktop wrapper for the Path of Exile 2 Party Finder. 

## When to run commands in this folder
You **must** `cd client` before running certain specific frontend tooling commands.

### Adding Shadcn UI Components
If you want to add new Shadcn UI components (buttons, dialogs, dropdowns, etc.), you **cannot** run the CLI tool from the monorepo root. You must be in this directory:

```bash
cd client
bunx shadcn@latest add dialog
bunx shadcn@latest add dropdown-menu
```
*Note: We are using Tailwind CSS v4 and React 19, so ensure you don't downgrade packages accidentally.*

### Building the Desktop App (Release Mode)
To compile a final `.exe` (or `.app` on macOS) for distribution:
```bash
cd client
bun run tauri build
```
*(Alternatively, you can run `bun run build` from the monorepo root).*

---

## Detailed Directory Structure

- `src/` (The React Application)
  - `components/`: Our isolated, reusable UI layer. We use ShadCN UI built on top of `@base-ui/react` primitives.
  - `routes/`: File-based routing powered by **TanStack Router**. To add a new page, create a file here or use the `@tanstack/router-plugin` (which generates the route tree automatically).
  - `lib/`: Utility files.
    - `api.ts`: Here we configure our **Eden client**. It imports the `App` type from the `@poe2-party-finder/server` workspace. This is the magic that gives us autocomplete for our backend API.
- `src-tauri/` (The Rust Desktop Wrapper)
  - Contains `tauri.conf.json` which configures window dimensions, permissions, and app identity.
  - Contains `src/main.rs` if we ever need to write custom Rust system-level plugins (e.g., global hotkeys, deeper OS integration).
- `vite.config.ts`: Configures the frontend bundler, Tailwind v4 plugin, and TanStack router plugin.

---

## Frontend Tech Stack Deep Dive

1. **Routing:** We use `@tanstack/react-router`. It is completely fully-typed. If you link to a page that doesn't exist, or pass the wrong search parameters, TypeScript will throw an error.
2. **Data Fetching:** We use `@tanstack/react-query` to cache data, handle loading states, and retry failed requests. 
3. **API Client:** We do not use `fetch` or `axios`. We use the Eden client (`@elysiajs/eden`).
   ```typescript
   import { api } from "@/lib/api"; // Points to our server

   // Automatically knows the exact shape of the response and required body parameters
   const { data, error } = await api.users.get({ query: { id: 1 } });
   ```
4. **Styling:** We use the Tailwind CSS v4, which is configured via CSS (`src/index.css`) rather than a `tailwind.config.ts` file.
