import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { TitleBar } from "@/components/title-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TitleBar>
        <SidebarProvider className="flex-1 overflow-hidden">
          <AppSidebar />
          <ScrollArea className="flex-1 h-full w-full relative">
            <Outlet />
          </ScrollArea>
        </SidebarProvider>
      </TitleBar>
    </ThemeProvider>
  ),
});
