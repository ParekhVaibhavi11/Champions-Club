import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-champion-red flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black uppercase text-champion-dark">Something went wrong</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-champion-dark hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
