import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback UI. If omitted the default styled error card is shown. */
  fallback?: React.ReactNode;
}

/**
 * React class-based Error Boundary.
 * Catches unhandled render errors in the tree below and displays a recovery UI.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught an unhandled error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;

      return (
        <div
          role="alert"
          className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans"
        >
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/20 rounded-3xl p-8 text-center space-y-5">
            <div className="mx-auto w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center" aria-hidden="true">
              <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-slate-100">Something went wrong</h1>
            <p className="text-sm text-slate-400">
              An unexpected error occurred. Our team has been notified.
            </p>
            {this.state.error && (
              <p className="text-xs font-mono text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl px-4 py-2 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.replace('/')}
                className="px-5 py-2.5 text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
