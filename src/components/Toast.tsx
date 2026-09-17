"use client";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Toast() {
  const toast = useStore((s) => s.ui.toast);
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 fade-in">
      <div
        className={cn(
          "rounded-md border px-4 py-2 text-xs font-medium shadow-lg backdrop-blur",
          toast.kind === "ok" && "border-ok/40 bg-ok/15 text-ok",
          toast.kind === "err" && "border-danger/40 bg-danger/15 text-danger",
          toast.kind === "info" && "border-accent2/40 bg-accent2/15 text-accent2",
        )}
      >
        {toast.text}
      </div>
    </div>
  );
}
