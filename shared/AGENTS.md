# Shared AGENTS.md

**AI Context**: Shared design tokens for client + website

## Architecture
- `src/styles/theme.css` - Single source of truth for design tokens
- CSS-first package (no app-specific UI rules)
- Affects both desktop app and website

## Required Patterns
- Treat `theme.css` as the single source of truth
- Assume changes affect both workspaces
- Do not move shared tokens into `client/` or `website/`
