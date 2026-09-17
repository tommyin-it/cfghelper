"use client";
import { useState } from "react";
import { Keyboard as KeyboardIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { KeyPickerModal } from "./KeyPickerModal";

/** Przycisk pokazujący (sugerowany) klawisz; klik otwiera okno wyboru klawisza. */
export function KeyPicker({
  value,
  onChange,
  binds,
  command,
  placeholder = "wybierz klawisz",
  size = "xs",
  className,
  title,
}: {
  value: string | null | undefined;
  onChange: (key: string) => void;
  binds: Record<string, string>;
  command?: string;
  placeholder?: string;
  size?: "xs" | "sm";
  className?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="key-picker"
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 font-mono transition-colors whitespace-nowrap",
          size === "xs" ? "h-6 text-[11px]" : "h-8 text-xs",
          value
            ? "border-accent/50 bg-accent/10 text-accent-hi hover:bg-accent/20 hover:border-accent"
            : "border-dashed border-accent2/50 bg-accent2/5 text-accent2 hover:bg-accent2/15",
          className,
        )}
        title="Zmień klawisz: naciśnij, kliknij myszą lub wybierz na klawiaturze"
      >
        <KeyboardIcon className="h-3 w-3 opacity-70" />
        {value ? value : placeholder}
      </button>
      <KeyPickerModal
        open={open}
        value={value ?? null}
        command={command}
        binds={binds}
        title={title}
        onSelect={(k) => {
          onChange(k);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
