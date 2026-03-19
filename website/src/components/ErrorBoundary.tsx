import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      "HydrationDemo Error Boundary caught an error:",
      error,
      errorInfo,
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                Hydration Error
              </span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mb-3">
              This component failed to hydrate properly.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200 px-2 py-1 rounded transition-colors"
            >
              Try Again
            </button>
            {import.meta.env.DEV && (
              <details className="mt-3">
                <summary className="text-xs text-red-500 cursor-pointer">
                  Error details
                </summary>
                <pre className="text-xs text-red-500 mt-1 whitespace-pre-wrap">
                  {this.state.error?.message}
                </pre>
              </details>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}
