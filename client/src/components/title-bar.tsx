import { useHotkey } from "@tanstack/react-hotkeys";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Copy, Minus, Pin, Square, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipPositioner,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TitleBar({ title }: { title: string }) {
  const appWindow = getCurrentWindow();
  const { state } = useSidebar();
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Check initial states
    appWindow.isMaximized().then(setIsMaximized);
    appWindow.isAlwaysOnTop().then(setIsAlwaysOnTop);

    // Listen to resize events to update the maximized state
    const unlisten = appWindow.onResized(async () => {
      setIsMaximized(await appWindow.isMaximized());
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [appWindow]);

  const toggleAlwaysOnTop = useCallback(async () => {
    const current = await appWindow.isAlwaysOnTop();
    const newState = !current;
    await appWindow.setAlwaysOnTop(newState);
    setIsAlwaysOnTop(newState);
  }, [appWindow]);

  useHotkey("Mod+Shift+T", toggleAlwaysOnTop);

  return (
    <div
      data-tauri-drag-region
      className="flex h-[48px] w-full shrink-0 relative z-50 items-center justify-end select-none bg-sidebar border-b"
    >
      {/* App Title */}
      <div
        data-tauri-drag-region
        className="mr-auto flex items-center h-full pl-2 overflow-hidden"
      >
        <span
          data-tauri-drag-region
          className={`truncate font-semibold transition-all ease-in-out duration-200 ${
            state === "collapsed"
              ? "translate-x-0"
              : "-translate-x-[10rem] pointer-events-none"
          }`}
        >
          {title}
        </span>
      </div>

      {/* Window Controls */}
      <div className="flex h-full items-center pointer-events-auto overflow-hidden">
        {/* Always on Top Button */}
        <Tooltip>
          <TooltipTrigger
            type="button"
            tabIndex={-1}
            onClick={toggleAlwaysOnTop}
            className={`inline-flex h-full w-[48px] flex-shrink-0 items-center justify-center hover:bg-white/10 transition-all duration-200 cursor-default ${
              isAlwaysOnTop ? "text-white opacity-100" : ""
            }`}
          >
            <Pin
              strokeWidth={2}
              size={16}
              className={`transition-transform duration-200 ${isAlwaysOnTop ? "fill-current" : "rotate-45"}`}
            />
          </TooltipTrigger>
          <TooltipPositioner side="bottom" sideOffset={8}>
            <TooltipContent className="flex items-center gap-2">
              Always on top
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <Kbd>Shift</Kbd>
                <Kbd>T</Kbd>
              </KbdGroup>
            </TooltipContent>
          </TooltipPositioner>
        </Tooltip>

        {/* Minimize Button */}
        <Tooltip>
          <TooltipTrigger
            type="button"
            tabIndex={-1}
            onClick={() => appWindow.minimize()}
            className="inline-flex h-full w-[48px] flex-shrink-0 items-center justify-center hover:bg-white/10 hover:text-white transition-colors cursor-default"
          >
            <Minus strokeWidth={1.5} size={16} />
          </TooltipTrigger>
          <TooltipPositioner side="bottom" sideOffset={8}>
            <TooltipContent>Minimize</TooltipContent>
          </TooltipPositioner>
        </Tooltip>

        {/* Maximize/Restore Button */}
        <Tooltip>
          <TooltipTrigger
            type="button"
            tabIndex={-1}
            onClick={() => appWindow.toggleMaximize()}
            className="inline-flex h-full w-[48px] flex-shrink-0 items-center justify-center hover:bg-white/10 hover:text-white transition-colors cursor-default"
          >
            {isMaximized ? (
              <Copy
                strokeWidth={1.5}
                size={13}
                className="scale-x-[-1] rotate-180"
              />
            ) : (
              <Square strokeWidth={1.5} size={14} />
            )}
          </TooltipTrigger>
          <TooltipPositioner side="bottom" sideOffset={8}>
            <TooltipContent>
              {isMaximized ? "Restore Down" : "Maximize"}
            </TooltipContent>
          </TooltipPositioner>
        </Tooltip>

        {/* Close Button */}
        <Tooltip>
          <TooltipTrigger
            type="button"
            tabIndex={-1}
            onClick={() => appWindow.close()}
            className="inline-flex h-full w-[48px] flex-shrink-0 items-center justify-center hover:bg-[#c42b1c] hover:text-white transition-colors cursor-default"
          >
            <X strokeWidth={1.5} size={18} />
          </TooltipTrigger>
          <TooltipPositioner side="bottom" sideOffset={8}>
            <TooltipContent>Close</TooltipContent>
          </TooltipPositioner>
        </Tooltip>
      </div>
    </div>
  );
}
