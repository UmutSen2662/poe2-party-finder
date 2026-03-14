import { useTheme } from "@/components/theme-provider";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Switch } from "@/components/ui/switch";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences and settings.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Appearance</h2>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-xs w-full text-left hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="space-y-1">
              <h3 className="font-medium leading-none">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <KbdGroup>
                <Kbd>Mod</Kbd>
                <Kbd>Shift</Kbd>
                <Kbd>D</Kbd>
              </KbdGroup>
              <Switch checked={theme === "dark"} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
