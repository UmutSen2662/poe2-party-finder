interface HydrationTimelineProps {
  method: string;
  currentState: "server" | "loading" | "hydrating" | "interactive" | "static";
  hydrationTime?: number | null;
}

type PhaseStatus = "completed" | "active" | "pending" | "disabled";

interface Phase {
  name: string;
  status: PhaseStatus;
}

export default function HydrationTimeline({
  method,
  currentState,
  hydrationTime,
}: HydrationTimelineProps) {
  const isStatic = method.startsWith("static");
  const isOnly = method.startsWith("client:only");

  const phases: Phase[] = isStatic
    ? [
        { name: "Server Render", status: "completed" as PhaseStatus },
        { name: "Static HTML", status: "active" as PhaseStatus },
        { name: "No Hydration", status: "disabled" as PhaseStatus },
      ]
    : isOnly
      ? [
          { name: "Server Render", status: "disabled" as PhaseStatus },
          {
            name: "Client Loading",
            status:
              currentState === "loading"
                ? ("active" as PhaseStatus)
                : ("completed" as PhaseStatus),
          },
          {
            name: "Interactive",
            status:
              currentState === "interactive"
                ? ("active" as PhaseStatus)
                : ("pending" as PhaseStatus),
          },
        ]
      : [
          { name: "Server Render", status: "completed" as PhaseStatus },
          {
            name: "Hydration",
            status:
              currentState === "hydrating"
                ? ("active" as PhaseStatus)
                : ("completed" as PhaseStatus),
          },
          {
            name: "Interactive",
            status:
              currentState === "interactive"
                ? ("active" as PhaseStatus)
                : ("pending" as PhaseStatus),
          },
        ];

  const getPhaseColor = (status: PhaseStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "active":
        return "bg-blue-500";
      case "pending":
        return "bg-gray-300 dark:bg-gray-600";
      case "disabled":
        return "bg-gray-200 dark:bg-gray-700";
      default:
        return "bg-gray-300";
    }
  };

  const getPhaseTextColor = (status: PhaseStatus) => {
    switch (status) {
      case "completed":
        return "text-green-700 dark:text-green-300";
      case "active":
        return "text-blue-700 dark:text-blue-300";
      case "pending":
        return "text-gray-500 dark:text-gray-400";
      case "disabled":
        return "text-gray-400 dark:text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
      <div className="text-xs font-medium text-muted-foreground mb-2">
        Hydration Timeline
      </div>
      <div className="flex items-center gap-2">
        {phases.map((phase, index) => (
          <div key={phase.name} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`w-2 h-2 rounded-full ${getPhaseColor(phase.status)}`}
              ></div>
              <div
                className={`text-xs mt-1 text-center ${getPhaseTextColor(phase.status)}`}
              >
                {phase.name}
              </div>
            </div>
            {index < phases.length - 1 && (
              <div
                className={`w-8 h-0.5 ${getPhaseColor(phases[index + 1].status)}`}
              ></div>
            )}
          </div>
        ))}
      </div>
      {hydrationTime && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Total time: {hydrationTime}ms
        </div>
      )}
    </div>
  );
}
