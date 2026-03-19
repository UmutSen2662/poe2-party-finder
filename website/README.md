# Website Documentation (Astro + React)

This workspace contains both the public-facing **Landing Page** and the authenticated **Admin Dashboard** for the Path of Exile 2 Party Finder.

It is built using [Astro](https://astro.build/) for maximum flexibility: allowing blazing-fast static generation for the public pages, and full React SPA capabilities for the admin dashboard.

## Tech Stack Overview
- **Core Framework:** [Astro v6](https://astro.build/)
- **UI Components:** React 19 + ShadCN UI
- **Styling:** Tailwind CSS v4 (Imported from the `shared` workspace package to guarantee identical styles to the desktop app)
- **API Client:** Eden (`@elysiajs/eden`)

## Development Commands

If you just want to run the whole stack (Desktop, API, and Website), run `bun run dev` from the **monorepo root**.

If you are working strictly inside the `website/` directory, you can use these commands:

| Command | Action |
| :--- | :--- |
| `bun run dev` | Starts local dev server at `localhost:4321` |
| `bun run build` | Build the site to `./dist/` |
| `bun run preview` | Preview your build locally before deploying |
| `bunx astro add [package]` | Add Astro integrations like React or Tailwind |

## Architecture Notes

### Shared Tailwind Theme
To ensure the website and desktop application look identical, the UI design tokens (colors, border radiuses, dark mode settings) do not live in this folder. 
They are defined centrally in `../shared/src/styles/theme.css`.
Our local `src/styles/global.css` automatically imports that shared theme file.

### Public Pages vs Admin Pages
- Public landing pages (e.g., `src/pages/index.astro`) should be built primarily with `.astro` files to guarantee zero JavaScript is shipped to SEO bots, falling back to React only for interactive islands.
- Admin dashboard pages (e.g., `src/pages/admin/`) will be structured using Astro to load heavy React dashboard client applications (`client:only="react"`).
