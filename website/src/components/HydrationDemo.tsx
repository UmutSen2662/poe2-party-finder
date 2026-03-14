import { useEffect, useState } from "react";

interface HydrationDemoProps {
  method: string;
}

export default function HydrationDemo({ method }: HydrationDemoProps) {
  const [count, setCount] = useState(0);
  const [hydratedAt, setHydratedAt] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHydratedAt(new Date().toLocaleTimeString());
  }, []);

  const isStatic = method.startsWith("static");
  const isOnly = method.startsWith("client:only");

  return (
    <div className="border border-border rounded-lg p-4 bg-card shadow-sm">
      <div className="mb-3">
        <span className="text-xs font-mono bg-secondary text-secondary-foreground px-2 py-1 rounded">
          {method}
        </span>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        {!isClient && !isOnly ? (
          <span className="text-orange-600 dark:text-orange-400">
            Server-rendered HTML only - no JavaScript
          </span>
        ) : isOnly ? (
          <span className="text-blue-600 dark:text-blue-400">
            Browser-only (no server render)
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
          disabled={isStatic}
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
          disabled={isStatic}
          className="w-10 h-10 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-bold"
        >
          +
        </button>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        {isStatic ? (
          <span className="text-orange-600 dark:text-orange-400">
            ✦ Static HTML - buttons don't work
          </span>
        ) : isOnly && !isClient ? (
          <span className="text-blue-600 dark:text-blue-400">
            ✦ Waiting for client...
          </span>
        ) : (
          <span className="text-green-600 dark:text-green-400">
            ✦ Fully interactive - click the buttons!
          </span>
        )}
      </div>
    </div>
  );
}
