import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isChunkLoadError } from '../lib/lazyWithRetry';

// A boundary so a single failed chunk or a stray throw degrades gracefully
// instead of unmounting the whole app and handing iOS Safari a reload loop.
//
// Two uses:
//   - Around the lazy Suspense tree: fallback={null} so the non-critical /
//     below-the-fold content just stays absent while Nav + Hero + Work (which
//     live outside the boundary) keep rendering.
//   - Around the whole app: a minimal, recoverable fallback so even a core
//     crash shows something a human can act on, not a blank page.

type Props = {
  children: ReactNode;
  // Static fallback, or a render function that gets the error + a retry fn.
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  label?: string;
};

type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Goes through the patched console → logged to app_logs, where this whole
    // class of bug was finally diagnosed.
    console.error(
      `[boundary${this.props.label ? `:${this.props.label}` : ''}]`,
      error?.message,
      { chunk: isChunkLoadError(error), componentStack: info?.componentStack },
    );
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return fallback(error, this.reset);
      return fallback ?? null;
    }
    return this.props.children;
  }
}
