import type { CfgData, GenerateOptions, SettingDef } from "./types";
import { categorize, CATEGORY_LABEL } from "./categorize";

export const DEFAULT_OPTIONS: GenerateOptions = {
  header: true,
  comments: true,
  unbindall: false,
  hostWriteconfig: true,
  echo: true,
};

const SETTINGS_CATEGORY_LABELS: Record<string, string> = {
  radar: "Radar",
  viewmodel: "Viewmodel",
  hud: "HUD",
  input: "Mysz i sterowanie",
  audio: "Dźwięk",
  video: "Wideo i wydajność",
  network: "Sieć i matchmaking",
  gameplay: "Rozgrywka",
  communication: "Komunikacja",
  practice: "Trening",
};

const CATEGORY_ORDER = [
  "radar",
  "viewmodel",
  "hud",
  "input",
  "audio",
  "video",
  "network",
  "gameplay",
  "communication",
  "crosshair",
  "practice",
  "server",
  "bots",
  "demo",
  "ui",
  "client",
  "scripting",
  "actions",
  "dev",
  "other",
];

export function quote(v: string): string {
  const s = String(v).trim();
  if (s === "") return '""';
  // wartości bez spacji/średników nie muszą być w cudzysłowie, ale cudzysłów jest bezpieczniejszy
  return `"${s.replace(/"/g, "")}"`;
}

function catLabel(id: string): string {
  return SETTINGS_CATEGORY_LABELS[id] ?? CATEGORY_LABEL[id] ?? id;
}

export function generateCfg(
  data: CfgData,
  opts: GenerateOptions,
  settings: SettingDef[],
): string {
  const byName = new Map(settings.map((s) => [s.name, s]));
  const lines: string[] = [];
  const c = (s: string) => opts.comments && lines.push(s.length ? `// ${s}` : "//");

  if (opts.header) {
    lines.push("// ==========================================================");
    lines.push("//  autoexec.cfg – wygenerowano w CFG Helper (cfghelper)");
    lines.push(`//  ${new Date().toISOString().slice(0, 10)}`);
    lines.push("//  Wgraj do: ...\\Counter-Strike Global Offensive\\game\\csgo\\cfg\\");
    lines.push("// ==========================================================");
    lines.push("");
  }

  if (opts.unbindall) {
    c("Czyszczenie wszystkich bindów (ustaw ponownie WSZYSTKIE klawisze poniżej!)");
    lines.push("unbindall");
    lines.push("");
  }

  // --- cvary pogrupowane po kategorii
  const groups = new Map<string, [string, string][]>();
  for (const [name, value] of Object.entries(data.cvars)) {
    const cat = byName.get(name)?.category ?? categorize(name);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push([name, value]);
  }
  const orderedCats = [...groups.keys()].sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 999) - (CATEGORY_ORDER.indexOf(b) + 1 || 999),
  );
  for (const cat of orderedCats) {
    c(`--- ${catLabel(cat)} ---`);
    for (const [name, value] of groups.get(cat)!) {
      const def = byName.get(name);
      const pad = opts.comments && def ? " ".repeat(Math.max(1, 44 - name.length - quote(value).length)) : "";
      const hint = opts.comments && def ? `${pad}// ${def.label}` : "";
      lines.push(`${name} ${quote(value)}${hint}`);
    }
    lines.push("");
  }

  // --- aliasy przed bindami (bind może się do nich odwoływać)
  if (data.aliases.length) {
    c("--- Aliasy ---");
    for (const a of data.aliases) {
      lines.push(`alias ${quote(a.name)} ${quote(a.command)}`);
    }
    lines.push("");
  }

  // --- bindy
  const bindEntries = Object.entries(data.binds).filter(([, cmd]) => cmd.trim() !== "");
  if (bindEntries.length) {
    c("--- Bindy ---");
    for (const [key, cmd] of bindEntries) {
      lines.push(`bind ${quote(key)} ${quote(cmd)}`);
    }
    lines.push("");
  }

  // --- własne linie
  const custom = data.custom.filter((l) => l.trim() !== "");
  if (custom.length) {
    c("--- Własne komendy ---");
    lines.push(...custom);
    lines.push("");
  }

  if (opts.hostWriteconfig) {
    c("Zapis ustawień do configu gry");
    lines.push("host_writeconfig");
  }
  if (opts.echo) {
    lines.push('echo "autoexec.cfg zaladowany - GLHF!"');
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/** Pojedyncza linia binda (do kopiowania / wklejenia w konsoli). */
export function bindLine(key: string, command: string): string {
  return `bind ${quote(key)} ${quote(command)}`;
}

/** Zbiór linii do wklejenia w konsoli (bez komentarzy, bez nagłówka). */
export function generateConsoleLines(data: CfgData): string {
  const out: string[] = [];
  for (const [n, v] of Object.entries(data.cvars)) out.push(`${n} ${quote(v)}`);
  for (const a of data.aliases) out.push(`alias ${quote(a.name)} ${quote(a.command)}`);
  for (const [k, cmd] of Object.entries(data.binds)) if (cmd.trim()) out.push(bindLine(k, cmd));
  out.push(...data.custom.filter((l) => l.trim()));
  return out.join("\n");
}
