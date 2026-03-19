import { useEffect, useState } from "react";
import HydrationTimeline from "./HydrationTimeline";

interface HydrationDemoProps {
  method: string;
}

export default function HydrationDemo({ method }: HydrationDemoProps) {
  const [count, setCount] = useState(0);
  const [hydratedAt, setHydratedAt] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [hydrationState, setHydrationState] = useState<
    "server" | "loading" | "hydrating" | "interactive" | "static"
  >("server");
  const [hydrationTime, setHydrationTime] = useState<number | null>(null);

  // Memoize method checks to avoid repeated string operations
  const isStatic = method.startsWith("static");
  const isOnly = method.startsWith("client:only");

  useEffect(() => {
    if (isStatic) {
      setHydrationState("static");
      return;
    }

    const startTime = performance.now();

    if (isOnly) {
      setHydrationState("loading");
    } else {
      setHydrationState("hydrating");
    }

    setIsClient(true);
    setHydratedAt(new Date().toLocaleTimeString());

    // Simulate hydration delay for visual effect
    // NOTE: These are artificial delays for demonstration purposes only!
    const hydrationDelay = isOnly ? 2000 : 1500;

    const timeoutId = setTimeout(() => {
      const endTime = performance.now();
      setHydrationTime(Math.round(endTime - startTime));
      setHydrationState("interactive");
    }, hydrationDelay);

    return () => clearTimeout(timeoutId);
  }, [isStatic, isOnly]);

  const getStatusColor = (state: typeof hydrationState) => {
    switch (state) {
      case "static":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "loading":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "hydrating":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "interactive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (state: typeof hydrationState) => {
    switch (state) {
      case "static":
        return "Static HTML";
      case "loading":
        return "Loading...";
      case "hydrating":
        return "Hydrating...";
      case "interactive":
        return "Interactive";
      default:
        return "Loading...";
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-card shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-mono bg-secondary text-secondary-foreground px-2 py-1 rounded">
          {method}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${getStatusColor(hydrationState)}`}
        >
          {getStatusText(hydrationState)}
        </span>
        {hydrationState === "hydrating" && (
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        )}
        {hydrationState === "loading" && (
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        )}
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        {!isClient && !isOnly ? (
          <span className="text-orange-600 dark:text-orange-400">
            Server-rendered HTML only - no JavaScript
          </span>
        ) : isOnly && hydrationState === "loading" ? (
          <span className="text-purple-600 dark:text-purple-400 flex items-center gap-2">
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-ping"></div>
            Browser-only (loading...)
          </span>
        ) : isOnly && !isClient ? (
          <span className="text-blue-600 dark:text-blue-400">
            Browser-only (no server render)
          </span>
        ) : hydrationState === "hydrating" ? (
          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
            Hydrating at {hydratedAt}...
          </span>
        ) : (
          <span className="text-green-600 dark:text-green-400">
            Hydrated at {hydratedAt}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setCount((c) => c - 1)}
          disabled={isStatic || hydrationState !== "interactive"}
          className="w-10 h-10 rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
        >
          -
        </button>

        <span className="text-2xl font-mono min-w-[3rem] text-center">
          {count}
        </span>

        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          disabled={isStatic || hydrationState !== "interactive"}
          className="w-10 h-10 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-bold"
        >
          +
        </button>
      </div>

      <div className="mt-3 text-xs text-muted-foreground space-y-1">
        {isStatic ? (
          <span className="text-orange-600 dark:text-orange-400">
            ✦ Static HTML - buttons don't work
          </span>
        ) : isOnly && hydrationState === "loading" ? (
          <span className="text-purple-600 dark:text-purple-400 flex items-center gap-2">
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-ping"></div>
            ✦ Waiting for hydration...
          </span>
        ) : isOnly && !isClient ? (
          <span className="text-blue-600 dark:text-blue-400">
            ✦ Waiting for client...
          </span>
        ) : hydrationState === "loading" || hydrationState === "hydrating" ? (
          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
            ✦ Becoming interactive...
          </span>
        ) : (
          <>
            <span className="text-green-600 dark:text-green-400">
              ✦ Fully interactive - click the buttons!
            </span>
            {hydrationTime && (
              <span className="text-gray-500 dark:text-gray-400">
                ⏱️ Hydrated in {hydrationTime}ms
              </span>
            )}
          </>
        )}
      </div>

      <HydrationTimeline
        method={method}
        currentState={hydrationState}
        hydrationTime={hydrationTime}
      />
    </div>
  );
}
