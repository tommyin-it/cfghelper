"use client";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

type Variant = "default" | "primary" | "ghost" | "danger" | "accent2";
type Size = "xs" | "sm" | "md";

export function Button({
  variant = "default",
  size = "sm",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-colors whitespace-nowrap",
        "disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent2/50",
        size === "xs" && "h-7 px-2 text-[11px]",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-10 px-4 text-sm",
        variant === "default" && "border-border2 bg-panel2 text-text hover:bg-panel3 hover:border-[#3d4a61]",
        variant === "primary" && "border-accent/60 bg-accent text-[#1a1200] hover:bg-accent-hi font-semibold",
        variant === "accent2" && "border-accent2/50 bg-accent2/15 text-accent2 hover:bg-accent2/25",
        variant === "ghost" && "border-transparent bg-transparent text-muted hover:text-text hover:bg-panel2",
        variant === "danger" && "border-danger/40 bg-danger/10 text-danger hover:bg-danger/20",
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
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide leading-none",
        tone === "gray" && "bg-panel3 text-muted border border-border2",
        tone === "amber" && "bg-accent/15 text-accent border border-accent/30",
        tone === "cyan" && "bg-accent2/10 text-accent2 border border-accent2/30",
        tone === "red" && "bg-danger/10 text-danger border border-danger/30",
        tone === "green" && "bg-ok/10 text-ok border border-ok/30",
        tone === "purple" && "bg-purple/10 text-purple border border-purple/30",
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
        "h-8 min-w-0 rounded-md border border-border2 bg-bg px-2.5 text-xs text-text placeholder:text-muted/70",
        "focus:outline-none focus:border-accent2/60 focus:ring-2 focus:ring-accent2/20",
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
        "h-8 rounded-md border border-border2 bg-bg px-2 text-xs text-text",
        "focus:outline-none focus:border-accent2/60 focus:ring-2 focus:ring-accent2/20",
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
      className={cn("inline-flex items-center gap-2 text-xs disabled:opacity-40", className)}
    >
      <span
        className={cn(
          "relative inline-block h-5 w-9 rounded-full border transition-colors",
          checked ? "bg-accent border-accent" : "bg-panel3 border-border2",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
      {label && <span className="text-text">{label}</span>}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-lg border border-border bg-panel", className)}>{children}</div>;
}

export function SectionTitle({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 mb-2", className)}>
      <h2 className="text-sm font-semibold tracking-wide text-text">{children}</h2>
      {right}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-block rounded border border-border2 bg-panel3 px-1.5 py-0.5 font-mono text-[11px] text-accent-hi">
      {children}
    </kbd>
  );
}

export function Code({ children, className }: { children: ReactNode; className?: string }) {
  return <code className={cn("rounded bg-panel3 px-1 py-0.5 font-mono text-[11px] text-accent2", className)}>{children}</code>;
}

export function Chip({ active, onClick, children, className }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 h-7 text-xs transition-colors whitespace-nowrap",
        active ? "border-accent bg-accent/15 text-accent-hi" : "border-border2 bg-panel2 text-muted hover:text-text hover:border-[#3d4a61]",
        className,
      )}
    >
      {children}
    </button>
  );
}
