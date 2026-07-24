"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * App-wide safety net. If any screen throws during render, visitors see a
 * calm branded recovery card with a "Return home" action instead of a blank
 * white screen — important for an unattended kiosk.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Surface in dev logs; on a kiosk this is otherwise invisible.
    console.error("[ErrorBoundary]", error);
  }

  reset = () => {
    this.setState({ hasError: false });
    if (typeof window !== "undefined") window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center text-center px-8 z-[9998]"
        style={{ background: "var(--background)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--diya-glow)" }} />
        <div className="relative z-10 max-w-md">
          <div className="m-divider mb-6"><span>✦</span></div>
          <h1 className="text-4xl mb-3" style={{ fontFamily: "Cormorant Garamond, serif", color: "var(--ivory)" }}>
            Something went wrong
          </h1>
          <p className="text-base mb-8" style={{ color: "var(--ink-muted)" }}>
            This screen hit a snag. Return home and try again.
          </p>
          <button onClick={this.reset} className="m-btn m-btn-primary">
            Return home
          </button>
        </div>
      </div>
    );
  }
}
