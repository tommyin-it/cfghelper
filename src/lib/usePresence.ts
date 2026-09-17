"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Utrzymuje element w DOM przez `exitMs` po zamknięciu, żeby dało się zagrać animację wyjścia.
 * Wejście animujemy przez @starting-style, wyjście przez atrybut data-closing.
 */
export function usePresence(open: boolean, exitMs = 160): { mounted: boolean; closing: boolean } {
  const [mounted, setMounted] = useState(open);
  const [prevOpen, setPrevOpen] = useState(open);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // otwarcie → montujemy natychmiast (wzorzec "derive state during render")
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setMounted(true);
  }

  useEffect(() => {
    if (open) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      return;
    }
    if (!mounted) return;
    timer.current = setTimeout(() => {
      setMounted(false);
      timer.current = null;
    }, exitMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [open, mounted, exitMs]);

  return { mounted, closing: mounted && !open };
}
