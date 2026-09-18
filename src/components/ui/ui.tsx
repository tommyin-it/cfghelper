"use client";
import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { Check, Copy } from "lucide-react";
import { cn, copyText } from "@/lib/utils";

type Variant = "default" | "primary" | "ghost" | "danger" | "accent2";
type Size = "xs" | "sm" | "md";

export function Button({
  variant = "default",
  size = "sm",
  icon,
  isStatic,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** przycisk zaczyna się ikoną – padding po stronie ikony o 2px mniejszy (wyrównanie optyczne) */
  icon?: boolean;
  /** bez skalowania przy wciśnięciu */
  isStatic?: boolean;
}) {
  return (
    <button
      className={cn(
        "btn inline-flex items-center justify-center gap-1.5 rounded-md border font-medium whitespace-nowrap select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none",
        isStatic && "btn-static",
        size === "xs" && (icon ? "h-7 ps-1.5 pe-2 text-[11.5px]" : "h-7 px-2 text-[11.5px]"),
        size === "sm" && (icon ? "h-8 ps-2.5 pe-3 text-xs" : "h-8 px-3 text-xs"),
        size === "md" && (icon ? "h-10 ps-3.5 pe-4 text-sm" : "h-10 px-4 text-sm"),
        variant === "default" && "border-border2 bg-panel text-text hover:bg-panel2 hover:border-border3 shadow-[0_1px_0_rgba(0,0,0,0.03)]",
        variant === "primary" && "border-ink bg-ink text-white hover:bg-ink-hover hover:border-ink-hover shadow-[0_1px_2px_rgba(0,0,0,0.12)]",
        variant === "accent2" && "border-accent2/30 bg-accent2/10 text-accent2 hover:bg-accent2/15",
        variant === "ghost" && "border-transparent bg-transparent text-muted hover:text-text hover:bg-panel3",
        variant === "danger" && "border-danger/30 bg-panel text-danger hover:bg-danger/5 hover:border-danger/50",
        className,
      )}
      {...props}
    />
  );
}

type Tone = "gray" | "amber" | "cyan" | "red" | "green" | "purple";
export function Badge({ tone = "gray", className, children, title }: { tone?: Tone; className?: string; children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-[3px] text-[10.5px] font-medium leading-none border",
        tone === "gray" && "bg-panel2 text-muted border-border",
        tone === "amber" && "bg-accent/10 text-accent-hi border-accent/25",
        tone === "cyan" && "bg-accent2/10 text-accent2 border-accent2/25",
        tone === "red" && "bg-danger/10 text-danger border-danger/25",
        tone === "green" && "bg-ok/10 text-ok border-ok/25",
        tone === "purple" && "bg-purple/10 text-purple border-purple/25",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-8 min-w-0 rounded-md border border-border2 bg-panel px-2.5 text-xs text-text placeholder:text-muted/70",
        "transition-[border-color,box-shadow] duration-150 ease",
        "focus:outline-none focus:border-accent2 focus:ring-[3px] focus:ring-accent2/15",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-8 rounded-md border border-border2 bg-panel px-2 text-xs text-text",
        "transition-[border-color,box-shadow] duration-150 ease",
        "focus:outline-none focus:border-accent2 focus:ring-[3px] focus:ring-accent2/15",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("btn group inline-flex items-center gap-2 text-xs disabled:opacity-40 rounded-md", className)}
    >
      <span
        className={cn(
          "relative inline-block h-[18px] w-8 rounded-full transition-colors duration-150 ease",
          checked ? "bg-ink" : "bg-border2 group-hover:bg-border3",
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] left-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
            "transition-transform duration-[160ms] ease-out",
            checked ? "translate-x-[14px]" : "translate-x-0",
          )}
        />
      </span>
      {label && <span className="text-text">{label}</span>}
    </button>
  );
}

export function Card({
  className,
  children,
  interactive,
  tone,
}: {
  className?: string;
  children: ReactNode;
  /** podnosi się lekko na hover */
  interactive?: boolean;
  /** stan: obwódka w kolorze */
  tone?: "accent" | "ok";
}) {
  return (
    <div className={cn("card rounded-lg", interactive && "card-hover", className)} data-tone={tone}>
      {children}
    </div>
  );
}

/** Cross-fade dwóch ikon (obie w DOM): scale 0.25→1, opacity, blur 4px→0. */
export function IconSwap({ active, a, b, className }: { active: boolean; a: ReactNode; b: ReactNode; className?: string }) {
  return (
    <span className={cn("icon-swap", className)} aria-hidden>
      <span data-hidden={active || undefined}>{a}</span>
      <span data-hidden={!active || undefined}>{b}</span>
    </span>
  );
}

/** Kwadratowy przycisk z ikoną (akcje wierszowe). */
export function IconButton({
  className,
  tone = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "default" | "danger" }) {
  return (
    <button
      type="button"
      className={cn(
        "btn inline-flex h-7 w-7 items-center justify-center rounded-md text-muted",
        tone === "default" && "hover:text-text hover:bg-panel3",
        tone === "danger" && "hover:text-danger hover:bg-danger/5",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 mb-2.5", className)}>
      <h2 className="text-[13px] font-semibold tracking-tight text-text">{children}</h2>
      {right}
    </div>
  );
}

/** Nagłówek zakładki: tytuł, opis i akcje – każda zakładka zaczyna się tak samo. */
export function PageHeader({
  title,
  desc,
  children,
  className,
}: {
  title: ReactNode;
  desc?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4", className)}>
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-text leading-tight">{title}</h1>
        {desc && <p className="text-[13px] text-muted mt-1 leading-snug max-w-2xl">{desc}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-block rounded-md border border-border2 bg-panel px-1.5 py-0.5 font-mono text-[11px] text-text shadow-[0_1px_0_var(--color-border2)]">
      {children}
    </kbd>
  );
}

export function Code({ children, className }: { children: ReactNode; className?: string }) {
  return <code className={cn("rounded-md bg-panel3 px-1.5 py-0.5 font-mono text-[11px] text-accent-hi", className)}>{children}</code>;
}

export function Chip({ active, onClick, children, className }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "btn rounded-full border px-3 h-7 text-xs whitespace-nowrap",
        active ? "border-ink bg-ink text-white" : "border-border2 bg-panel text-muted hover:text-text hover:border-border3",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Przycisk kopiowania z chwilowym potwierdzeniem (crossfade z blur). */
export function CopyButton({
  text,
  label = "Kopiuj",
  doneLabel = "Skopiowano",
  size = "sm",
  variant = "default",
  iconOnly,
  className,
  title,
  onCopied,
}: {
  text: string | (() => string);
  label?: string;
  doneLabel?: string;
  size?: Size;
  variant?: Variant;
  iconOnly?: boolean;
  className?: string;
  title?: string;
  onCopied?: (ok: boolean) => void;
}) {
  const [done, setDone] = useState(false);
  const onClick = async () => {
    const ok = await copyText(typeof text === "function" ? text() : text);
    onCopied?.(ok);
    if (ok) {
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    }
  };
  const icons = <IconSwap active={done} a={<Copy className="h-3.5 w-3.5" />} b={<Check className="h-3.5 w-3.5 text-ok" />} />;
  if (iconOnly) {
    return (
      <IconButton onClick={onClick} title={title ?? label} aria-label={title ?? label} className={className}>
        {icons}
      </IconButton>
    );
  }
  return (
    <Button size={size} variant={variant} icon onClick={onClick} title={title} className={className}>
      {icons}
      <span key={done ? "d" : "c"} className="swap">
        {done ? doneLabel : label}
      </span>
    </Button>
  );
}
