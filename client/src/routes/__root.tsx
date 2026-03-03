import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { TitleBar } from "@/components/title-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider } from "@/components/ui/sidebar";

const title = "Pact of Exile";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider className="w-screen h-screen">
        <AppSidebar title={title} />
        <div className="flex flex-col flex-1 h-full min-w-0 min-h-0 relative z-0">
          <TitleBar title={title} />
          <ScrollArea className="flex-1 min-h-0 w-full relative">
            <Outlet />
          </ScrollArea>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  ),
});
