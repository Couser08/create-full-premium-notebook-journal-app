import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App crashed:", error, errorInfo);
  }

  handleReset = () => {
    // Clear potentially corrupted local storage
    window.localStorage.clear();
    // Reload the page completely
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <div className="flex max-w-md flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-xl">
            <div className="grid size-16 place-items-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="size-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Oops! Something went wrong.</h1>
              <p className="mt-2 text-sm text-gray-500">
                The app encountered an unexpected error. This is usually caused by outdated data in your browser caching from a previous version.
              </p>
            </div>
            <div className="w-full rounded-lg bg-gray-100 p-4 text-left text-xs font-mono text-gray-600 overflow-auto max-h-32">
              {this.state.error?.message || "Unknown error"}
            </div>
            <button
              onClick={this.handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              <RefreshCw className="size-4" />
              Clear Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
