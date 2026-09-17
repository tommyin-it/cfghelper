import type { CfgData, GenerateOptions } from "./types";
import { normalizeKeyName } from "@/data/keys";
import { isIdentifier } from "./utils";

export interface ParseResult {
  data: CfgData;
  options: Partial<GenerateOptions>;
  /** liczba rozpoznanych instrukcji */
  count: number;
  warnings: string[];
}

/** Dzieli linię na instrukcje po `;` (poza cudzysłowami) i usuwa komentarze `//`. */
function splitStatements(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQ = !inQ;
      cur += ch;
      continue;
    }
    if (!inQ && ch === "/" && line[i + 1] === "/") break;
    if (!inQ && ch === ";") {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

/** Tokenizacja z obsługą cudzysłowów. */
export function tokenize(stmt: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  let inQ = false;
  let had = false;
  for (const ch of stmt) {
    if (ch === '"') {
      inQ = !inQ;
      had = true;
      continue;
    }
    if (!inQ && /\s/.test(ch)) {
      if (cur || had) tokens.push(cur);
      cur = "";
      had = false;
      continue;
    }
    cur += ch;
  }
  if (cur || had) tokens.push(cur);
  return tokens;
}

const SKIP_COMMANDS = new Set(["echo", "clear", "exec", "host_writeconfig", "unbindall"]);

/** Parsuje tekst autoexec.cfg (lub linie wklejone z konsoli) do struktury CfgData. */
export function parseCfg(text: string): ParseResult {
  const data: CfgData = { cvars: {}, binds: {}, aliases: [], custom: [] };
  const options: Partial<GenerateOptions> = {};
  const warnings: string[] = [];
  let count = 0;

  // .vcfg (KeyValues) – wykrywamy po nawiasach klamrowych i nazwach bloków
  if (/^\s*"?(config|bind|convars|keys)"?\s*\{/im.test(text) || /^\s*\{\s*$/m.test(text)) {
    return parseVcfg(text);
  }

  for (const rawLine of text.split(/\r?\n/)) {
    for (const stmt of splitStatements(rawLine)) {
      const t = tokenize(stmt);
      if (!t.length) continue;
      const cmd = t[0].toLowerCase();

      if (cmd === "bind" && t.length >= 2) {
        const key = normalizeKeyName(t[1]);
        const command = t.slice(2).join(" ").trim();
        if (command) data.binds[key] = command;
        else delete data.binds[key];
        count++;
        continue;
      }
      if (cmd === "unbind" && t.length >= 2) {
        delete data.binds[normalizeKeyName(t[1])];
        count++;
        continue;
      }
      if (cmd === "unbindall") {
        options.unbindall = true;
        data.binds = {};
        count++;
        continue;
      }
      if (cmd === "alias" && t.length >= 2) {
        const name = t[1];
        const command = t.slice(2).join(" ").trim();
        data.aliases = data.aliases.filter((a) => a.name !== name);
        if (command) data.aliases.push({ name, command });
        count++;
        continue;
      }
      if (cmd === "host_writeconfig") {
        options.hostWriteconfig = true;
        count++;
        continue;
      }
      if (cmd === "echo") {
        options.echo = true;
        count++;
        continue;
      }
      if (SKIP_COMMANDS.has(cmd)) {
        if (cmd === "exec") data.custom.push(stmt);
        count++;
        continue;
      }
      // cvar: dokładnie 2 tokeny, identyfikator bez + / -
      if (t.length === 2 && isIdentifier(t[0]) && !/^[+-]/.test(t[0])) {
        data.cvars[t[0]] = t[1];
        count++;
        continue;
      }
      // wszystko inne (komendy z argumentami, +akcje, itd.) trafia do własnych linii
      if (!data.custom.includes(stmt)) data.custom.push(stmt);
      count++;
    }
  }
  return { data, options, count, warnings };
}

/** Parser plików .vcfg z folderu Steam (cs2_user_keys_0_slot0.vcfg / cs2_user_convars_0_slot0.vcfg). */
export function parseVcfg(text: string): ParseResult {
  const data: CfgData = { cvars: {}, binds: {}, aliases: [], custom: [] };
  const warnings: string[] = [];
  let count = 0;
  const stack: string[] = [];
  let pendingKey: string | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\/\/.*$/, "").trim();
    if (!line) continue;
    if (line === "{") {
      stack.push((pendingKey ?? "").toLowerCase());
      pendingKey = null;
      continue;
    }
    if (line === "}") {
      stack.pop();
      continue;
    }
    const m = line.match(/^"([^"]*)"\s*(?:"([^"]*)")?$/) ?? line.match(/^(\S+)\s+"?([^"]*)"?$/);
    if (!m) continue;
    if (m[2] === undefined) {
      pendingKey = m[1];
      continue;
    }
    const key = m[1];
    const value = m[2];
    const ctx = stack[stack.length - 1] ?? "";
    if (ctx === "bind" || ctx === "binds" || ctx === "keys") {
      data.binds[normalizeKeyName(key)] = value;
      count++;
    } else if (ctx === "convars" || ctx === "config" || ctx === "") {
      if (key.includes("$")) {
        warnings.push(`Pominięto zmienną z '$': ${key}`);
        continue;
      }
      if (isIdentifier(key)) {
        data.cvars[key] = value;
        count++;
      }
    }
  }
  return { data, options: {}, count, warnings };
}
