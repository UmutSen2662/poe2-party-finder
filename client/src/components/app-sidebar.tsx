import { Link, useLocation } from "@tanstack/react-router";
import { HomeIcon, Mail, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppSidebar({ title }: { title: string }) {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="select-none">
      <SidebarHeader data-tauri-drag-region className="border-b h-[48px]">
        <SidebarMenu>
          <SidebarMenuItem
            data-tauri-drag-region
            className="flex items-center justify-between w-full h-full"
          >
            <span
              data-tauri-drag-region
              className="truncate font-semibold group-data-[collapsible=icon]:hidden pl-2"
            >
              {title}
            </span>
            <SidebarTrigger className="ml-auto size-8 cursor-pointer" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent
        data-tauri-drag-region
        className="overflow-x-hidden [&::-webkit-scrollbar]:hidden"
      >
        <SidebarGroup data-tauri-drag-region>
          <SidebarGroupContent>
            <SidebarMenu data-tauri-drag-region className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Home"
                  isActive={location.pathname === "/"}
                  render={<Link to="/" aria-label="Home" />}
                >
                  <HomeIcon />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Posts"
                  isActive={location.pathname.startsWith("/posts")}
                  render={<Link to="/posts-example" aria-label="Posts" />}
                >
                  <Mail />
                  <span>Posts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Separator />
      <SidebarFooter data-tauri-drag-region>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Settings"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              // @ts-expect-error The settings route hasn't been created yet but the user just wants to preview the UI
              render={<Link to="/settings" />}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="https://github.com/shadcn.png" alt="Umut" />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Umut</span>
              </div>
              <div>
                <Settings size={20} className="mr-1" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
