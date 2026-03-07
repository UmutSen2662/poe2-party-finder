import { useHotkey } from "@tanstack/react-hotkeys";
import { useTheme } from "./theme-provider";

export function GlobalHotkeys() {
  const { theme, setTheme } = useTheme();

  useHotkey("Mod+Shift+D", () => {
    setTheme(theme === "dark" ? "light" : "dark");
  });

  return null;
}
