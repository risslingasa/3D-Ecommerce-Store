import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('BUNTO° ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F2E9] text-[#3E3A3C] px-6">
          <div className="max-w-md w-full border border-[#E6D9D2] p-8 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#716D71]">
              BUNTO°
            </p>
            <h1 className="mt-4 text-2xl font-medium tracking-tight">
              Something went out of place
            </h1>
            <p className="mt-3 text-sm text-[#716D71] leading-relaxed">
              We ran into a brief hiccup syncing your session. Refresh to continue
              exploring the collection.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center border-b border-[#3E3A3C] pb-1 text-[10px] font-medium uppercase tracking-[0.32em] text-[#3E3A3C] hover:opacity-65 transition-opacity cursor-pointer"
            >
              Reload Storefront
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
