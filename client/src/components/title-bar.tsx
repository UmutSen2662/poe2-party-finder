import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function TitleBar({ title }: { title: string }) {
  const appWindow = getCurrentWindow();
  const { state } = useSidebar();

  return (
    <div
      data-tauri-drag-region
      className="flex h-[48px] w-full shrink-0 relative z-50 items-center justify-end select-none bg-sidebar border-b"
    >
      {/* App Title */}
      <div className="mr-auto flex items-center h-full pl-2 overflow-hidden">
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
          <Square strokeWidth={1.5} size={12} />
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => appWindow.close()}
          className="inline-flex h-full w-[46px] flex-shrink-0 items-center justify-center hover:bg-[#c42b1c] hover:text-white transition-colors cursor-default"
        >
          <X strokeWidth={1.5} size={18} />
        </button>
      </div>
    </div>
  );
}
