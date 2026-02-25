# Path of Exile 2 Party Finder

A modern, full-stack monorepo application designed as a party finder for Path of Exile 2. This project is built with end-to-end type safety and packaged as a native desktop application.

## Tech Stack Overview

This repository uses **Bun Workspaces** to manage both the server and client packages natively in a unified monorepo structure.

### Server-side Stack
- **Runtime:** [Bun](https://bun.sh/)
- **Web Framework:** [Elysia.js](https://elysiajs.com/) (A fast, ergonomic web framework optimized for Bun)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) (TypeScript SQL ORM)
- **Database Driver:** PostgreSQL (`postgres` package)
- **API Pattern:** Endpoints are defined using Elysia, exporting the App's type signature so the frontend can consume it with complete end-to-end type safety.

### Client-side Stack
- **Desktop Wrapper:** [Tauri v2](https://v2.tauri.app/) (Compiles the web app into a lightweight native desktop application)
- **Package Bundler:** [Vite](https://vitejs.dev/)
- **UI & Styling:** React 19 + Tailwind CSS v4
- **Routing:** [TanStack Router](https://tanstack.com/router/latest) (Fully type-safe routing)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **API Client:** [Eden (Elysia Client)](https://elysiajs.com/eden/overview.html) (`@elysiajs/eden`). Imports the backend `App` type to provide absolute type safety and autocomplete when calling backend routes.

## The "Post Board" Demo

Currently, the project contains a foundational **"Post Board" / Bulletin Board** feature. **This is intended purely as a demonstration** to show how all pieces of this stack interact and how features should be implemented moving forward.

### How the Demo Works (Logical Workflow)
1. **Database:** A simple `posts` table tracks `title`, `content`, and `createdAt` timestamps.
2. **Backend Engine (`server/src/index.ts`):** 
   - Exposes a `GET /posts` endpoint to fetch all active posts in descending order.
   - Exposes a `POST /posts` endpoint to create a new post entry in the PostgreSQL database.
3. **Frontend Implementation (`client/src/routes/index.tsx`):**
   - The desktop wrapper launches a React UI that uses TanStack Query to fetch and display the posts list.
   - A form uses Eden's type-safe `api.posts.post` mutation to send data to the backend. Upon success, the UI instantly refetches and updates the board.

This fully functional demo serves as a reference architecture for building out the actual PoE 2 party-finding features using this type-safe stack.

## Getting Started

To install dependencies for both the client and server workspaces:

```bash
bun install
```

To run the development server (which concurrently starts the backend API and the Tauri desktop app):

```bash
bun run dev
```
