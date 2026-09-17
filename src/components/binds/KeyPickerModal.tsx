"use client";
import { useEffect, useRef } from "react";
import { X, Crosshair, TriangleAlert, MousePointerClick } from "lucide-react";
import { Keyboard } from "./Keyboard";
import { CODE_TO_KEY, KEY_BY_ID, keyFromMouseButton, keyLabel } from "@/data/keys";
import { Button, Kbd } from "../ui/ui";

export interface KeyPickerModalProps {
  open: boolean;
  /** aktualny lub sugerowany klawisz */
  value?: string | null;
  /** komenda, dla której wybieramy klawisz (do informacji o konflikcie) */
  command?: string;
  binds: Record<string, string>;
  title?: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}

/**
 * Okno wyboru klawisza: przechwytuje fizyczne naciśnięcie klawisza (globalnie),
 * kliknięcie przyciskiem myszy / kółko w strefie przechwytywania, albo klik na wirtualnej klawiaturze.
 */
export function KeyPickerModal({ open, value, command, binds, title, onSelect, onClose }: KeyPickerModalProps) {
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      const id = CODE_TO_KEY[e.code];
      if (id && !KEY_BY_ID[id]?.disabled) {
        e.preventDefault();
        e.stopPropagation();
        onSelect(id);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onSelect, onClose]);

  // strefa przechwytywania myszy: natywne listenery (wheel musi być non-passive, żeby zablokować scroll)
  useEffect(() => {
    if (!open) return;
    const el = zoneRef.current;
    if (!el) return;
    const prevent = (e: Event) => e.preventDefault();
    const onDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const id = keyFromMouseButton(e.button);
      if (id) onSelect(id);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY !== 0) onSelect(e.deltaY < 0 ? "mwheelup" : "mwheeldown");
    };
    el.addEventListener("mousedown", onDown);
    el.addEventListener("mouseup", prevent);
    el.addEventListener("auxclick", prevent);
    el.addEventListener("contextmenu", prevent);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseup", prevent);
      el.removeEventListener("auxclick", prevent);
      el.removeEventListener("contextmenu", prevent);
      el.removeEventListener("wheel", onWheel);
    };
  }, [open, onSelect]);

  if (!open) return null;
  const conflict = value && binds[value] && (!command || binds[value] !== command) ? binds[value] : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Wybierz klawisz"}
    >
      <div className="w-full max-w-[1040px] rounded-lg border border-border bg-panel shadow-2xl fade-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Crosshair className="h-4 w-4 text-accent2 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{title ?? "Wybierz klawisz"}</div>
            {command && (
              <div className="text-[11px] text-muted font-mono truncate" title={command}>
                {command}
              </div>
            )}
          </div>
          {value && (
            <div className="text-xs text-muted hidden sm:flex items-center gap-1.5">
              sugerowany: <Kbd>{value}</Kbd>
              <span className="text-muted/70">{keyLabel(value)}</span>
            </div>
          )}
          <button onClick={onClose} className="text-muted hover:text-text" aria-label="Zamknij">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-3 sm:p-4 space-y-3">
          <div
            ref={zoneRef}
            tabIndex={0}
            data-testid="key-capture-zone"
            className="rounded-md border border-dashed border-accent2/50 bg-accent2/5 px-4 py-3 text-center text-xs cursor-crosshair select-none focus:outline-none focus:ring-2 focus:ring-accent2/40"
          >
            <div className="font-semibold text-accent2 inline-flex items-center gap-1.5">
              <MousePointerClick className="h-4 w-4" /> Naciśnij klawisz na klawiaturze…
            </div>
            <div className="text-muted mt-0.5">
              …albo kliknij tutaj przyciskiem myszy (LPM / PPM / środkowy / boczne) lub przewiń tu kółkiem
            </div>
          </div>
          <div className="text-[11px] text-muted">Możesz też kliknąć klawisz na wirtualnej klawiaturze. Pomarańczowe klawisze są już zbindowane.</div>
          <Keyboard compact binds={binds} selected={value ?? null} onSelect={onSelect} />
          {conflict && (
            <div className="flex items-center gap-2 text-xs text-warn">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              <span>
                Klawisz <Kbd>{value}</Kbd> ma już bind <code className="font-mono text-text">{conflict}</code> – zostanie nadpisany.
              </span>
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Anuluj (Esc)
            </Button>
            {value && (
              <Button variant="primary" onClick={() => onSelect(value)}>
                Użyj: {value}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
