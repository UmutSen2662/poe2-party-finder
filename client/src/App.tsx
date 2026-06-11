import { QueryClientProvider } from "@tanstack/react-query";
import { Activity, Suspense, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { Layout } from "./layout";
import { queryClient } from "./lib/queryClient";
import { BadgePage } from "./pages/badge-page";
import { LobbyPage } from "./pages/lobby-page";
import { LoginPage } from "./pages/login-page";
import { SearchPage } from "./pages/search-page";
import { ServerErrorPage } from "./pages/server-error-page";
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

function AppContent() {
  const { loading, isAuthenticated, serverError } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground w-full h-full">
        Loading...
      </div>
    );
  }

  if (serverError) {
    return <ServerErrorPage />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
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

        <TabPage currentTab={activeTab} tabId="lobby" mode="hide">
          <LobbyPage />
        </TabPage>

        <TabPage currentTab={activeTab} tabId="badges" mode="hide">
          <BadgePage />
        </TabPage>

        <TabPage currentTab={activeTab} tabId="test" mode="hide">
          <TestPage />
        </TabPage>

        <TabPage currentTab={activeTab} tabId="settings" mode="unmount">
          <SettingsPage />
        </TabPage>
      </Suspense>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
