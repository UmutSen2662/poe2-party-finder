import { QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { queryClient } from "./lib/queryClient";
import "./App.css";

// Import the auto-generated route tree
import { routeTree } from "./routeTree.gen";

// Create a memory history instance (critical for Tauri, avoiding browser URL dependency)
const memoryHistory = createMemoryHistory({
  initialEntries: ["/"],
});

// Create a new router instance using the memory history Component and inject the QueryClient
const router = createRouter({
  routeTree,
  history: memoryHistory,
  context: {
    queryClient,
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
