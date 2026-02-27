import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ThemeProvider } from "../components/theme-provider";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col font-sans antialiased bg-background text-foreground">
        <header className="px-8 py-6 flex items-center sticky top-0 z-10 shadow-sm bg-card border-b">
          <h1 className="m-0 text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            POE2 Party Finder
          </h1>
        </header>
        <main className="flex-1 p-8 max-w-3xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Devtools (will automatically compile out in production builds) */}
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools position="bottom" />
      </div>
    </ThemeProvider>
  ),
});
