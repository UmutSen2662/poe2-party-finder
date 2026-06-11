import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export function ServerErrorPage() {
  const { logout } = useAuth();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleClearAndLogin = () => {
    logout();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-destructive">
            Connection Error
          </CardTitle>
          <CardDescription>
            Unable to connect to the server. Please check your connection and
            try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              The application could not reach the server at{" "}
              <code className="bg-muted px-1 py-0.5 rounded">localhost:3000</code>
              .
            </p>
            <p>
              This could mean:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The server is not running</li>
              <li>There's a network connection issue</li>
              <li>Your authentication session has expired</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={handleRetry} className="w-full">
              Retry Connection
            </Button>
            <Button
              onClick={handleClearAndLogin}
              variant="outline"
              className="w-full"
            >
              Clear Data & Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
