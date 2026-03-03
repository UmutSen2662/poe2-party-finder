# Path of Exile 2 Party Finder

<div align="center">

![Tauri](https://img.shields.io/badge/tauri-%2324C8DB.svg?style=for-the-badge&logo=tauri&logoColor=%23FFFFFF)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![ElysiaJS](https://img.shields.io/badge/elysia.js-F24E1E?style=for-the-badge&logo=elysiajs&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Biome](https://img.shields.io/badge/biome-60a5fa.svg?style=for-the-badge&logo=biome&logoColor=white)

</div>

A modern, full-stack monorepo application designed as a party finder for Path of Exile 2. This project is built with end-to-end type safety and packaged as a native desktop application.

## Monorepo Architecture Overview

This repository uses **Bun Workspaces** to manage both the server and client packages natively. This means we have a single, unified repository, but it's logically separated into two distinct "workspaces" (`client` and `server`).

- **Root:** Manages global dependencies (`concurrently`, `@biomejs/biome`) and provides global wrapper scripts.
- **`server/`:** Contains the Elysia backend API and database schemas.
- **`client/`:** Contains the React frontend and Tauri desktop runtime.

If a command affects both parts of the app (like starting the whole project, or linting everything), run it from the **Root**. If a command is specific to frontend tooling (like adding a Shadcn component) or backend tooling (like generating database migrations), you must `cd` into the respective workspace first.

### Server-side Stack
(See the detailed [Server Documentation](./server/README.md) for database management and adding endpoints.)
- **Runtime:** [Bun](https://bun.sh/)
- **Web Framework:** [Elysia.js](https://elysiajs.com/) 
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database Driver:** PostgreSQL (`postgres` package)
- **API Pattern:** Endpoints are defined using Elysia, exporting the App's type signature so the frontend can consume it with complete end-to-end type safety.

### Client-side Stack
(See the detailed [Client Documentation](./client/README.md) for UI components, routing, and querying the API.)
- **Desktop Wrapper:** [Tauri v2](https://v2.tauri.app/)
- **Package Bundler:** [Vite v7](https://vitejs.dev/)
- **UI & Styling:** React 19 + Tailwind CSS v4 + ShadCN UI
- **Routing:** [TanStack Router](https://tanstack.com/router/latest)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest)
- **API Client:** Eden (`@elysiajs/eden`)

---

## Prerequisites

- [Bun](https://bun.sh/) (v1.3.9 or higher is recommended)
- A running PostgreSQL database (for the backend)
- OS-specific build tools for Tauri (e.g., MSVC and Windows SDK on Windows). See the [Tauri Prerequisites Guide](https://v2.tauri.app/start/prerequisites/).

---

## Global Scripts (Run these in the Root directory)

The `package.json` in the root directory provides helper scripts so you rarely need to start the client and server separately when testing.

### Installation
```bash
bun install
```
This single command installs all dependencies for the root, the `client` workspace, and the `server` workspace. You do not need to `bun install` inside each folder.

### Running the App
```bash
bun run dev
```
Start both the backend API and the Tauri desktop app concurrently.

### Database Operations from Root
```bash
bun run db:generate   # Generates SQL migrations (runs in /server)
bun run db:migrate    # Pushes schema to the Postgres database (runs in /server)
bun run db:studio     # Opens Drizzle Studio to view database tables (runs in /server)
```

### Formatting & Linting
We use [Biome](https://biomejs.dev/) for blazing-fast formatting and linting across the entire monorepo.
```bash
bun run format        # Auto-format all files
bun run lint          # Lint all files
bun run check         # Format, lint, and sort imports in all files
```

### Typechecking
```bash
bun run typecheck
```
Runs TypeScript compiler checks (`tsc --noEmit`) concurrently on both workspaces to ensure end-to-end type-safety is maintained.

---

## Application Features

The project has evolved into a fully functional native desktop application featuring custom frameless window controls and dynamic routing. The core stack components seamlessly interact to provide a high-performance experience.

1. **Native Desktop Integration (`client/src-tauri` / Frontend):**
   - The application runs as a frameless native window powered by Tauri v2.
   - Core window controls (Minimize, Maximize, Close) and dragging are implemented natively in Rust (`src-tauri/src/main.rs`) and triggered seamlessly via the frontend unified Titlebar and Sidebar components.

2. **Frontend UI & Dashboard (`client/src/routes/index.tsx`):**
   - A complex, interactive dashboard featuring dynamic filtering, price range controls, and categorizations.
   - Built with Shadcn UI, structured responsive sidebars, and tailored Tailwind styling.

3. **Database & API (`server/src`):**
   - The database schemas natively support categories and post items (`posts`, `categories`), exposed via the `GET /posts` and `POST /posts` endpoints.
   - The frontend consumes these using Eden's end-to-end type-safe `api.posts` and `api.categories` queries and mutations. TanStack Query automatically refetches to keep the dashboard instantly synchronized.
