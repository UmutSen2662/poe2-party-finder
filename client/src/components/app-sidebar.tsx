import { useHotkey } from "@tanstack/react-hotkeys";
import { FlaskConical, HomeIcon, Mail, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
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

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  // Navigation Hotkeys
  useHotkey("Mod+1", () => setActiveTab("home"));
  useHotkey("Mod+2", () => setActiveTab("posts"));
  useHotkey("Mod+3", () => setActiveTab("test"));
  useHotkey("Mod+4", () => setActiveTab("settings"));

  return (
    <Sidebar collapsible="icon" className="select-none">
      <SidebarHeader
        data-tauri-drag-region
        className="py-0 justify-center border-b h-[3rem]"
      >
        <SidebarMenu>
          <SidebarMenuItem
            data-tauri-drag-region
            className="flex items-center justify-between w-full h-full"
          >
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
                  tooltip={{
                    children: (
                      <div className="flex items-center gap-2">
                        Home
                        <KbdGroup>
                          <Kbd>Ctrl</Kbd>
                          <Kbd>1</Kbd>
                        </KbdGroup>
                      </div>
                    ),
                  }}
                  isActive={activeTab === "home"}
                  onClick={() => setActiveTab("home")}
                >
                  <HomeIcon />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: (
                      <div className="flex items-center gap-2">
                        Posts
                        <KbdGroup>
                          <Kbd>Ctrl</Kbd>
                          <Kbd>2</Kbd>
                        </KbdGroup>
                      </div>
                    ),
                  }}
                  isActive={activeTab === "posts"}
                  onClick={() => setActiveTab("posts")}
                >
                  <Mail />
                  <span>Posts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: (
                      <div className="flex items-center gap-2">
                        Test
                        <KbdGroup>
                          <Kbd>Ctrl</Kbd>
                          <Kbd>3</Kbd>
                        </KbdGroup>
                      </div>
                    ),
                  }}
                  isActive={activeTab === "test"}
                  onClick={() => setActiveTab("test")}
                >
                  <FlaskConical />
                  <span>Test</span>
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
              tooltip={{
                children: (
                  <div className="flex items-center gap-2">
                    Settings
                    <KbdGroup>
                      <Kbd>Ctrl</Kbd>
                      <Kbd>4</Kbd>
                    </KbdGroup>
                  </div>
                ),
              }}
              isActive={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
