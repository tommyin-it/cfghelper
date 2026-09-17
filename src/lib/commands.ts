"use client";
import { useEffect, useState } from "react";
import type { CommandEntry, Visibility } from "./types";
import { ACTIONS } from "@/data/actions";

let cache: CommandEntry[] | null = null;
let inflight: Promise<CommandEntry[]> | null = null;

export function loadCommands(): Promise<CommandEntry[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/data/commands.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<CommandEntry[]>;
      })
      .then((list) => {
        const names = new Set(list.map((e) => e.n));
        const extra: CommandEntry[] = ACTIONS.filter((a) => !names.has(a.command) && !a.command.includes(" ")).map(
          (a) => ({
            n: a.command,
            k: "cmd",
            d: null,
            f: ["client", "release"],
            h: a.desc ?? a.label,
            c: "actions",
            v: "release",
            src: "c",
          }),
        );
        cache = [...list, ...extra].sort((a, b) => a.n.localeCompare(b.n));
        return cache;
      });
  }
  return inflight;
}

export function useCommands(): { commands: CommandEntry[] | null; error: string | null } {
  const [commands, setCommands] = useState<CommandEntry[] | null>(cache);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadCommands()
      .then((c) => alive && setCommands(c))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, []);
  return { commands, error };
}

export interface SearchOptions {
  q: string;
  category?: string | null;
  visibility?: Set<Visibility>;
  kind?: "all" | "cmd" | "cvar";
  cheat?: "all" | "no" | "only";
  limit?: number;
}

export function searchCommands(list: CommandEntry[], o: SearchOptions): { results: CommandEntry[]; total: number } {
  const q = o.q.trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { e: CommandEntry; s: number }[] = [];
  for (const e of list) {
    if (o.category && e.c !== o.category) continue;
    if (o.visibility && !o.visibility.has(e.v)) continue;
    if (o.kind && o.kind !== "all" && e.k !== o.kind) continue;
    const isCheat = e.f.includes("cheat");
    if (o.cheat === "no" && isCheat) continue;
    if (o.cheat === "only" && !isCheat) continue;
    if (!terms.length) {
      scored.push({ e, s: 0 });
      continue;
    }
    const name = e.n.toLowerCase();
    const help = e.h.toLowerCase();
    let score = 0;
    let ok = true;
    for (const t of terms) {
      if (name === t) score += 100;
      else if (name.startsWith(t)) score += 50;
      else if (name.includes(t)) score += 25;
      else if (help.includes(t)) score += 5;
      else {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (e.v === "release") score += 3;
    else if (e.v === "hidden") score += 1;
    scored.push({ e, s: score });
  }
  if (terms.length) scored.sort((a, b) => b.s - a.s || a.e.n.localeCompare(b.e.n));
  const total = scored.length;
  return { results: scored.slice(0, o.limit ?? 200).map((x) => x.e), total };
}

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  release: "widoczna",
  hidden: "ukryta",
  dev: "dev-only",
};

export const FLAG_LABEL: Record<string, string> = {
  archive: "zapisywana (archive)",
  cheat: "wymaga sv_cheats",
  release: "widoczna w konsoli",
  hidden: "ukryta w konsoli",
  devonly: "tylko build deweloperski",
  replicated: "replikowana z serwera",
  client: "klient",
  server: "serwer",
  userinfo: "userinfo",
  per_user: "per użytkownik",
  notify: "powiadamia graczy",
  protected: "chroniona",
  norecord: "nie nagrywana w demo",
  clientcmd_can_execute: "klient może wykonać",
  server_can_execute: "serwer może wykonać",
  client_can_execute: "klient może wykonać",
  demo: "demo",
  menubar_item: "menu deweloperskie",
  unlogged: "bez logowania",
  per_tick: "per tick",
  notconnected: "gdy niepołączony",
  linked_concommand: "powiązana komenda",
  vconsole_fuzzy_matching: "vconsole",
  vconsole_set_focus: "vconsole",
  server_cannot_query: "serwer nie odczyta",
};
