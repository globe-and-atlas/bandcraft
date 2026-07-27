import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Catches render-time exceptions anywhere in the tree (a bad prop, a missing
 * import, a null-deref in a modal or feature panel) and shows a recoverable
 * fallback instead of an unstyled blank screen. This app has no other safety
 * net — several bugs this session (a missing `React` import, an undefined
 * lookup) took the entire session down to a blank page with no way back
 * short of a manual reload, which erased whatever the student was doing. */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Bandcraft crashed:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <main className="app-crash-screen" role="alert">
          <div className="app-crash-card">
            <h1>Something broke</h1>
            <p>
              A part of the app hit an unexpected error. Your progress in this session may be lost for whatever
              screen was open, but the rest of the app should work again after resetting this view.
            </p>
            <pre className="app-crash-detail">{this.state.error.message}</pre>
            <div className="app-crash-actions">
              <button type="button" className="btn-small" onClick={this.handleReset}>
                Try to continue
              </button>
              <button type="button" className="btn-small header-reset-btn" onClick={() => window.location.reload()}>
                Reload the page
              </button>
            </div>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
