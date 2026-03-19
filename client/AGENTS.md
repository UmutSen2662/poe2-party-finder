# AGENTS.md

## Stack
- React 19
- Tailwind CSS v4
- Vite 7
- Tauri v2
- ShadCN UI (`new-york` style)
- TanStack Query v5
- Eden client
- Lucide React icons

## Rules
- Do not add a URL router here.
- Preserve the custom tab-based routing/state-persistence model in `src/App.tsx`.
- Use CSS display toggling and React 19 `<Activity>` patterns for state persistence.
- Use TanStack Query for server state.
- Use Eden for API calls.
- Keep theme variables in `shared/src/styles/theme.css`.
- Do not define global design tokens in this workspace.
- Use the `@/` path alias for `./src/` imports.
- Run ShadCN CLI from this directory, not from the monorepo root.
- Use Lucide React for icons unless a file already establishes a different pattern.

## Commands and Runtime
- Dev server port: `1420`
- Add components: `bunx shadcn@latest add <component>`
