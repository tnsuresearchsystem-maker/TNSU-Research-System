import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let errorDetails = null;

      try {
        if (this.state.error?.message) {
           const parsedError = JSON.parse(this.state.error.message);
           if (parsedError.error) {
               errorMessage = "Database Error";
               errorDetails = parsedError;
           }
        }
      } catch (e) {
        // Not a JSON error
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">{errorMessage}</h2>
            
            {errorDetails ? (
                <div className="mt-4 text-sm text-gray-600 bg-gray-100 p-3 rounded overflow-auto max-h-60">
                    <p><strong>Operation:</strong> {errorDetails.operationType}</p>
                    <p><strong>Path:</strong> {errorDetails.path}</p>
                    <p><strong>Details:</strong> {errorDetails.error}</p>
                    <p className="mt-2 text-xs text-gray-500">Please contact an administrator or check your permissions.</p>
                </div>
            ) : (
                <p className="text-center text-gray-600 mb-6">
                  We're sorry, but something went wrong. Please try refreshing the page.
                </p>
            )}
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
