"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook that automatically hides navigation controls (back/home/arrows)
 * after a specified delay of user inactivity, and immediately reveals them
 * whenever the user touches or interacts with the screen.
 *
 * @param delayMs Inactivity delay in milliseconds before hiding controls (default: 2500ms)
 * @param active Whether auto-hide tracking should be active for the current view
 */
export function useAutoHideControls(delayMs: number = 2500, active: boolean = true) {
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetControlsTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (active) {
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, delayMs);
    }
  }, [delayMs, active]);

  useEffect(() => {
    if (!active) {
      setControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      return;
    }

    resetControlsTimer();

    const handleInteraction = () => {
      resetControlsTimer();
    };

    const events = ["pointerdown", "pointermove", "touchstart", "click", "keydown", "wheel"];
    events.forEach((e) => window.addEventListener(e, handleInteraction, { passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleInteraction));
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [active, resetControlsTimer]);

  return { controlsVisible, resetControlsTimer };
}
