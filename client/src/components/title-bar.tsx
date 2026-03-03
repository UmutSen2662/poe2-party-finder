import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import type { ReactNode } from "react";

export function TitleBar({ children }: { children?: ReactNode }) {
  const appWindow = getCurrentWindow();

  return (
    <div className="flex flex-col h-screen w-full font-sans antialiased bg-background text-foreground overflow-hidden">
      <div
        data-tauri-drag-region
        className="flex h-9 w-full shrink-0 relative z-50 items-center justify-end select-none bg-sidebar"
      >
        {/* Window Controls */}
        <div className="flex h-full items-center pointer-events-auto overflow-hidden">
          {/* Minimize Button */}
          <button
            type="button"
            onClick={() => appWindow.minimize()}
            className="inline-flex h-full w-[46px] flex-shrink-0 items-center justify-center hover:bg-white/10 hover:text-white transition-colors cursor-default"
          >
            <Minus strokeWidth={1.5} size={15} />
          </button>

          {/* Maximize Button */}
          <button
            type="button"
            onClick={() => appWindow.toggleMaximize()}
            className="inline-flex h-full w-[46px] flex-shrink-0 items-center justify-center hover:bg-white/10 hover:text-white transition-colors cursor-default"
          >
            <Square strokeWidth={1.5} size={13} />
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => appWindow.close()}
            className="inline-flex h-full w-[46px] flex-shrink-0 items-center justify-center hover:bg-[#c42b1c] hover:text-white transition-colors cursor-default"
          >
            <X strokeWidth={1.5} size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 w-full overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  );
}
