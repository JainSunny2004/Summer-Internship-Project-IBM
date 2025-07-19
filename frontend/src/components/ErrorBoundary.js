import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-netflix-black flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🎬</div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-400 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-netflix w-full"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="btn-secondary w-full"
              >
                Go Home
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-gray-800 rounded-lg text-left">
                <h3 className="text-sm font-semibold text-red-400 mb-2">
                  Error Details (Development Only):
                </h3>
                <pre className="text-xs text-gray-300 overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-gray-400 mt-2 overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
