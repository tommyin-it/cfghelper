import type { CfgData } from "./types";
import type { PresetLike } from "./store";
import { PRESET_BY_ID } from "@/data/presets";

export interface Suggestion {
  id: string;
  kind: "tip" | "warn";
  title: string;
  desc: string;
  /** dane do jednorazowego zastosowania (jeśli jest) */
  apply?: PresetLike;
  applyLabel?: string;
}

function presetToApply(id: string): PresetLike | undefined {
  const p = PRESET_BY_ID[id];
  if (!p) return undefined;
  return {
    cvars: p.cvars,
    binds: p.binds?.filter((b) => b.key).map((b) => ({ key: b.key!, command: b.command })),
    aliases: p.aliases,
    custom: p.custom,
  };
}

const num = (v: string | undefined) => (v === undefined ? undefined : Number(v));

/** Analiza aktualnego configu → lista sugestii i ostrzeżeń. */
export function getSuggestions(d: CfgData): Suggestion[] {
  const out: Suggestion[] = [];
  const bindCmds = Object.values(d.binds).map((c) => c.toLowerCase());
  const has = (fn: (c: string) => boolean) => bindCmds.some(fn);
  const cv = d.cvars;

  // --- OSTRZEŻENIA
  const music = num(cv.snd_musicvolume);
  if (music === 0) {
    out.push({
      id: "warn-music-0",
      kind: "warn",
      title: "snd_musicvolume 0 wycisza ostrzeżenie 10 s przed wybuchem",
      desc: "Zamiast zerować muzykę ogólną, wyzeruj poszczególne głośności (menu, MVP, koniec rundy) i zostaw snd_tensecondwarning_volume.",
      apply: { cvars: { snd_musicvolume: "1", ...(PRESET_BY_ID["audio-competitive"].cvars ?? {}) } },
      applyLabel: "Napraw",
    });
  }
  for (const [key, cmd] of Object.entries(d.binds)) {
    const c = cmd.toLowerCase();
    const parts = c.split(";").map((s) => s.trim());
    const hasJump = parts.some((p) => p === "+jump" || p.startsWith("+jump"));
    const hasAttack = parts.some((p) => p === "-attack" || p === "+attack" || p === "-attack2");
    if (hasJump && hasAttack) {
      out.push({
        id: `warn-multi-${key}`,
        kind: "warn",
        title: `Bind „${key}” łączy skok i atak – blokowany w matchmakingu`,
        desc: "Od 19.08.2024 oficjalne serwery Valve odrzucają bindy łączące kilka akcji ruchu/ataku. Działa tylko na serwerach społeczności.",
      });
    }
    const alias = d.aliases.find((a) => a.name.toLowerCase() === parts[0]);
    if (alias) {
      const ac = alias.command.toLowerCase();
      if (ac.includes("+jump") && (ac.includes("-attack") || ac.includes("+attack"))) {
        out.push({
          id: `warn-alias-${key}`,
          kind: "warn",
          title: `Alias „${alias.name}” (klawisz ${key}) to jumpthrow – blokowany w MM`,
          desc: "Użyj go tylko do treningu na serwerze lokalnym/community. W MM użyj presetu „Jumpthrow legalny w MM”.",
        });
      }
    }
  }
  const cheatCmds = ["noclip", "sv_rethrow_last_grenade", "bot_place", "god", "give ", "cl_showpos", "bot_stop", "sv_infinite_ammo"];
  const cheatBinds = Object.entries(d.binds).filter(([, c]) => cheatCmds.some((x) => c.toLowerCase().includes(x)));
  if (cheatBinds.length) {
    out.push({
      id: "warn-cheat-binds",
      kind: "warn",
      title: `${cheatBinds.length} bind(ów) wymaga sv_cheats 1`,
      desc: `Klawisze: ${cheatBinds.map(([k]) => k).join(", ")}. Na oficjalnych serwerach nic nie zrobią – to normalne dla bindów treningowych.`,
    });
  }
  const dupCmd = new Map<string, string[]>();
  for (const [k, c] of Object.entries(d.binds)) {
    const key = c.trim().toLowerCase();
    if (!key) continue;
    dupCmd.set(key, [...(dupCmd.get(key) ?? []), k]);
  }
  for (const [c, keys] of dupCmd) {
    if (keys.length > 1 && c !== "+jump" && !c.startsWith("buy ") && !c.startsWith("say")) {
      out.push({
        id: `info-dup-${c}`,
        kind: "warn",
        title: `Komenda „${c}” jest na kilku klawiszach`,
        desc: `Klawisze: ${keys.join(", ")}. To nie błąd, ale sprawdź, czy tak chcesz.`,
      });
    }
  }
  if (Object.keys(d.binds).length === 0 && Object.keys(cv).length === 0 && d.custom.length === 0) {
    out.push({
      id: "empty",
      kind: "tip",
      title: "Zacznij od zakładki „Polecane”",
      desc: "Jednym kliknięciem dodasz najpopularniejsze ustawienia: zoom radaru, granaty na klawiszach, telemetrię, dźwięk pod granie.",
    });
  }

  // --- PODPOWIEDZI
  if (!has((c) => c.includes("cl_radar_scale") || c.includes("toggleradarscale"))) {
    out.push({
      id: "tip-radar-zoom",
      kind: "tip",
      title: "Dodaj zoom radaru na klawiszach",
      desc: "Pomniejszanie i powiększanie radaru w trakcie rundy – najczęściej polecany bind.",
      apply: presetToApply("radar-zoom-keys"),
      applyLabel: "Dodaj bindy - / =",
    });
  }
  if (cv.cl_radar_always_centered === undefined || cv.cl_radar_always_centered === "1") {
    out.push({
      id: "tip-radar-centered",
      kind: "tip",
      title: "Wyłącz centrowanie radaru",
      desc: "cl_radar_always_centered 0 pokazuje więcej mapy, gdy stoisz przy jej krawędzi.",
      apply: { cvars: { cl_radar_always_centered: "0" } },
      applyLabel: "Ustaw 0",
    });
  }
  if (cv.cl_radar_scale === undefined) {
    out.push({
      id: "tip-radar-scale",
      kind: "tip",
      title: "Zmniejsz zoom radaru",
      desc: "Domyślne 0.7 pokazuje mało mapy. Większość graczy używa 0.35–0.5.",
      apply: { cvars: { cl_radar_scale: "0.4", cl_hud_radar_scale: "1.15", cl_radar_icon_scale_min: "0.7" } },
      applyLabel: "Ustaw 0.4",
    });
  }
  if (cv.cl_hud_telemetry_ping_show === undefined) {
    out.push({
      id: "tip-telemetry",
      kind: "tip",
      title: "Ping i FPS zawsze w HUD",
      desc: "Zamiennik net_graph z CS:GO – telemetria w rogu ekranu.",
      apply: presetToApply("telemetry-always"),
      applyLabel: "Włącz",
    });
  }
  if (!has((c) => /slot(6|7|8|9|10)\b/.test(c) || c.includes("use weapon_"))) {
    out.push({
      id: "tip-grenades",
      kind: "tip",
      title: "Granaty na osobnych klawiszach",
      desc: "Osobny klawisz na smoke, flash, HE i molotova zamiast przewijania slot4.",
      apply: presetToApply("grenade-slots"),
      applyLabel: "Dodaj (C/Z/X/V/4)",
    });
  }
  if (!has((c) => c.includes("voice_modenable") || c.includes("snd_voipvolume"))) {
    out.push({
      id: "tip-voice",
      kind: "tip",
      title: "Klawisz do wyciszenia voice chatu",
      desc: "voice_modenable_toggle – jeden klawisz, zero toksyczności.",
      apply: presetToApply("voice-toggle"),
      applyLabel: "Dodaj (J)",
    });
  }
  if (cv.snd_menumusic_volume === undefined) {
    out.push({
      id: "tip-audio",
      kind: "tip",
      title: "Wyłącz muzykę, zostaw ostrzeżenie 10 s",
      desc: "Zestaw głośności pod granie kompetytywne.",
      apply: presetToApply("audio-competitive"),
      applyLabel: "Zastosuj",
    });
  }
  if (cv.fps_max === undefined) {
    out.push({
      id: "tip-fps",
      kind: "tip",
      title: "Ustaw limit FPS",
      desc: "fps_max 0 (bez limitu) lub wartość pod monitor. Domyślne 400 bywa przyczyną mikroprzycięć.",
      apply: presetToApply("perf-basics"),
      applyLabel: "Zastosuj podstawy",
    });
  }
  if (cv.mm_dedicated_search_maxping === undefined) {
    out.push({
      id: "tip-maxping",
      kind: "tip",
      title: "Ogranicz ping w matchmakingu",
      desc: "mm_dedicated_search_maxping 60 – szukanie tylko serwerów z dobrym pingiem.",
      apply: presetToApply("net-basics"),
      applyLabel: "Zastosuj",
    });
  }
  if (!has((c) => c === "switchhands")) {
    out.push({
      id: "tip-switchhands",
      kind: "tip",
      title: "Zmiana ręki na klawiszu",
      desc: "switchhands – przydatne przy trzymaniu kątów po lewej stronie.",
      apply: presetToApply("switchhands"),
      applyLabel: "Dodaj (L)",
    });
  }
  if (cv.cl_autohelp === undefined) {
    out.push({
      id: "tip-autohelp",
      kind: "tip",
      title: "Wyłącz podpowiedzi dla nowych graczy",
      desc: "cl_autohelp 0 i cl_versus_intro 0 – mniej rozpraszaczy.",
      apply: { cvars: { cl_autohelp: "0", cl_versus_intro: "0" } },
      applyLabel: "Wyłącz",
    });
  }
  if (!has((c) => c === "+jump") && !d.binds.mwheeldown) {
    out.push({
      id: "tip-mwheel",
      kind: "tip",
      title: "Skok na kółku myszy",
      desc: "Ułatwia bunnyhop i skoki – opcjonalnie.",
      apply: presetToApply("mwheel-jump"),
      applyLabel: "Dodaj",
    });
  }
  return out;
}
