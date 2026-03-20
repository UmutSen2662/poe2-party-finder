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
