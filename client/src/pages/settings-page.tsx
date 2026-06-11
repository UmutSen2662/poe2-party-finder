import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

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
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-semibold">Account Profile</h2>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">In-Game Name</p>
            <Select value={user?.ign || ""}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectPositioner>
                <SelectContent>
                  <SelectItem value={user?.ign || ""}>
                    {user?.ign || "N/A"}
                  </SelectItem>
                  <SelectItem value="coming-soon" disabled>
                    Coming soon
                  </SelectItem>
                </SelectContent>
              </SelectPositioner>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Host Rating</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {(user?.hostRating ?? 0).toFixed(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({user?.hostThumbsUp || 0} 👍 / {user?.hostThumbsDown || 0}{" "}
                  👎)
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer Rating</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {(user?.customerRating ?? 0).toFixed(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({user?.customerThumbsUp || 0} 👍 /{" "}
                  {user?.customerThumbsDown || 0} 👎)
                </span>
              </div>
            </div>
          </div>
        </div>

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
