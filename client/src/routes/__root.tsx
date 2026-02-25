import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-50 font-sans antialiased">
      <header className="px-8 py-6 bg-slate-800 border-b border-slate-700 flex items-center sticky top-0 z-10 shadow-md">
        <h1 className="m-0 text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
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
  ),
});
