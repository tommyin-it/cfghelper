import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
}

/** Normalizuje wartość bool z cfg (true/false/1/0) do "1"/"0". */
export function normalizeBool(v: string): "0" | "1" {
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" ? "1" : "0";
}

/** Czy nazwa wygląda jak poprawny identyfikator cvara/komendy. */
export function isIdentifier(s: string): boolean {
  return /^[+-]?[A-Za-z_][A-Za-z0-9_.]*$/.test(s);
}
