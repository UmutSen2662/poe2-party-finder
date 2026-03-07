import { QueryClientProvider } from "@tanstack/react-query";
import { Activity, Suspense, useState } from "react";
import { Layout } from "./layout";
import { queryClient } from "./lib/queryClient";
import { PostsPage } from "./pages/posts-page";
import { SearchPage } from "./pages/search-page";
import { SettingsPage } from "./pages/settings-page";
import { TestPage } from "./pages/test-page";
import "./App.css";

type KeepAliveMode = "unmount" | "activity" | "hide";

interface TabPageProps {
  currentTab: string;
  tabId: string;
  mode?: KeepAliveMode;
  children: React.ReactNode;
}

function TabPage({
  currentTab,
  tabId,
  mode = "unmount",
  children,
}: TabPageProps) {
  const isActive = currentTab === tabId;

  if (mode === "unmount") {
    return isActive ? children : null;
  }

  if (mode === "activity") {
    return (
      <Activity mode={isActive ? "visible" : "hidden"}>{children}</Activity>
    );
  }

  return (
    <div
      style={{
        display: isActive ? "block" : "none",
        height: "100%",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <QueryClientProvider client={queryClient}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12 text-muted-foreground w-full h-full">
              Loading services...
            </div>
          }
        >
          <TabPage currentTab={activeTab} tabId="home" mode="hide">
            <SearchPage />
          </TabPage>

          <TabPage currentTab={activeTab} tabId="posts" mode="unmount">
            <PostsPage />
          </TabPage>

          <TabPage currentTab={activeTab} tabId="test" mode="unmount">
            <TestPage />
          </TabPage>

          <TabPage currentTab={activeTab} tabId="settings" mode="unmount">
            <SettingsPage />
          </TabPage>
        </Suspense>
      </Layout>
    </QueryClientProvider>
  );
}
