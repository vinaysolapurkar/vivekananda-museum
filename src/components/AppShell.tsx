"use client";

import { LanguageProvider } from "@/components/LanguageProvider";
import AttractMode from "@/components/AttractMode";
import ErrorBoundary from "@/components/ErrorBoundary";

/**
 * Client wrapper mounted once in the root layout. Provides the language
 * context to the whole app, the idle screensaver, and a crash safety net.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ErrorBoundary>{children}</ErrorBoundary>
      <AttractMode />
    </LanguageProvider>
  );
}
