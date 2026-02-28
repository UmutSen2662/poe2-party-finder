import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen gap-6 text-center">
      <h2 className="text-4xl font-bold tracking-tight">
        Welcome to PoE2 Party Finder
      </h2>
      <p className="text-lg text-muted-foreground max-w-[600px]">
        This is a clean starting point. The demonstration post board has been
        moved.
      </p>
      <Link
        to="/posts-example"
        className="text-sm font-medium text-primary hover:underline underline-offset-4"
      >
        View the Posts Demo
      </Link>
    </div>
  );
}
