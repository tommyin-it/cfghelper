"use client";
import { useState } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useStore, type ToastMsg } from "@/lib/store";
import { usePresence } from "@/lib/usePresence";
import { cn } from "@/lib/utils";

export function Toast() {
  const toast = useStore((s) => s.ui.toast);
  const { mounted, closing } = usePresence(!!toast, 220);
  const [last, setLast] = useState<ToastMsg | null>(toast);
  if (toast && toast !== last) setLast(toast);
  const t = toast ?? last;
  if (!mounted || !t) return null;
  const Icon = t.kind === "ok" ? CheckCircle2 : t.kind === "err" ? AlertCircle : Info;
  return (
    <div
      className="toast fixed bottom-5 left-1/2 z-[60] pointer-events-none"
      data-closing={closing || undefined}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-2 rounded-lg border bg-panel px-3.5 py-2.5 text-xs font-medium",
          "shadow-[0_8px_24px_rgba(20,20,30,0.10),0_1px_2px_rgba(20,20,30,0.06)]",
          t.kind === "ok" && "border-ok/25 text-text",
          t.kind === "err" && "border-danger/30 text-danger",
          t.kind === "info" && "border-accent2/30 text-text",
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", t.kind === "ok" && "text-ok", t.kind === "err" && "text-danger", t.kind === "info" && "text-accent2")} />
        {t.text}
      </div>
    </div>
  );
}
