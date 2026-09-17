#!/usr/bin/env python3
"""
Scala dumpy cvarów CS2 w jeden plik src/data/commands.json.

Źródła (CC0 / MIT):
  data/raw/arminc_cvarlist_2025-05.md   - ArmynC/ArminC-CS2-Cvars (v1.40.7.9, maj 2025)  -> nazwy, domyślne, opisy
  data/raw/sugol_cvarlist_2024-11.log   - SuGolYolLom/CS2-Cvars-Cmds (v1.40.5.1, lis 2024) -> flagi devonly / hidden

Widoczność (pole "v"):
  release - cvar z flagą FCVAR_RELEASE, widoczny w konsoli
  hidden  - brak FCVAR_RELEASE lub flaga hidden: nie podpowiada się w konsoli, ale często da się ustawić
  dev     - FCVAR_DEVELOPMENTONLY: tylko w buildach deweloperskich, w zwykłej grze nie działa
"""
import json, re, html, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARM = os.path.join(ROOT, "data/raw/arminc_cvarlist_2025-05.md")
SUG = os.path.join(ROOT, "data/raw/sugol_cvarlist_2024-11.log")
OUT = os.path.join(ROOT, "public/data/commands.json")

CATEGORY_RULES = [
    (r"^[+-]", "actions"),
    (r"^(bind|unbind|unbindall|alias|exec|echo|toggle|incrementvar|multvar|key_|BindToggle|bindtoggle|cvarlist|find|help|host_writeconfig|con_|toggleconsole|clear$|quit$|disconnect$|exit$)", "scripting"),
    (r"^(cl_radar_|cl_hud_radar)", "radar"),
    (r"^(cl_crosshair|crosshair)", "crosshair"),
    (r"^(viewmodel_|cl_viewmodel|cl_wpn_sway|cl_bob|cl_righthand|switchhands)", "viewmodel"),
    (r"^(m_|sensitivity|zoom_sensitivity|joy_|joystick|input_|option_|cl_scoreboard_mouse)", "input"),
    (r"^(snd_|volume$|voice_|cc_|dsp_|sound|steamaudio|cl_embedded_stream_audio|adsp_)", "audio"),
    (r"^(cl_hud_|hud_|safezone|cl_teamid|cl_teammate|cl_show|cl_draw|cl_deathnotice|cl_scoreboard|cl_color|cl_clanid|cl_sanitize|cl_playerspray|cl_spraysay|cl_hide|cl_display|cl_obs_|cl_spec|spec_|cl_grenadecrosshair|cl_quickinventory|cl_use_opens|cl_buywheel|cl_dm_|cl_autohelp|cl_prefer_lefthanded|cl_silencer|cl_player_ping|cl_mute|gameinstructor)", "hud"),
    (r"^(net_|rate$|cl_interp|cl_net_|cl_tickpacket|cl_clock|cl_timeout|cl_resend|cl_lagcomp|cl_predict|cl_cmdrate|cl_updaterate|sv_maxrate|sv_minrate|sv_maxupdaterate|sv_minupdaterate|mm_|ui_playsettings|steam_|sdr|cl_join_advertise|cl_invites|matchmaking|lobby|party_)", "network"),
    (r"^(r_|mat_|fps_|engine_|video|csm_|fog_|particle|cloth_|lb_|sc_|sparseshadowtree|vis_|gpu|dx|vulkan|shader|texture|lightmap|dynamic_|cl_ragdoll|ragdoll_|cl_jiggle|cl_particle|cl_phys|cl_decal|cl_ent_)", "video"),
    (r"^(mp_|sv_|game_|ammo_|cash_|weapon_|inferno_|molotov|contributionscore_|healthshot|cs_|csgo_|ff_|tr_|mapoverview|map_|changelevel|map$|maps$)", "server"),
    (r"^(bot_|nav_)", "bots"),
    (r"^(tv_|demo_|demo|record$|stop$|playdemo|listdemo|cl_demo)", "demo"),
    (r"^(ui_|cl_mainmenu|cl_inventory|cl_loadout|cl_borderless|cl_compass|cl_menu|panorama_|cachedvalue_|cl_promo|cl_news)", "ui"),
    (r"^(ent_|phys_|animgraph_|ik_|script_|imgui_|vprof_|debug_|dev_|ai_|npc|prop_|save_|test|log_|mem_|thread|vprof|prof_|dump|print|report_|sv_debug|cl_debug|physics|phys|scene|soundscape|tools|vconsole|cl_showerror|developer|con_)", "dev"),
    (r"^cl_", "client"),
]

CATEGORIES = {
    "actions": "Akcje (+/-)",
    "scripting": "Bindy i skrypty",
    "radar": "Radar",
    "crosshair": "Celownik",
    "viewmodel": "Viewmodel",
    "input": "Mysz i sterowanie",
    "audio": "Dźwięk",
    "hud": "HUD i interfejs gry",
    "network": "Sieć i matchmaking",
    "video": "Wideo i wydajność",
    "server": "Serwer i rozgrywka",
    "bots": "Boty i nawigacja",
    "demo": "Demo i GOTV",
    "ui": "Menu i UI",
    "dev": "Debug i deweloperskie",
    "client": "Klient (inne)",
    "other": "Inne",
}

def categorize(name):
    for rx, cat in CATEGORY_RULES:
        if re.search(rx, name, re.IGNORECASE):
            return cat
    return "other"

def clean(s):
    s = html.unescape(s or "")
    s = s.replace("<br>", "\n").strip()
    s = re.sub(r"[ \t]+", " ", s)
    return s

# --- SuGol log: name : default/cmd : flags : description
sug = {}
with open(SUG, encoding="utf-8", errors="replace") as f:
    for line in f.read().splitlines()[2:]:
        parts = [p.strip() for p in line.split(" : ", 3)]
        if len(parts) < 3:
            continue
        name, default, flags = parts[0], parts[1], parts[2]
        desc = parts[3] if len(parts) > 3 else ""
        sug[name] = {
            "default": None if default == "cmd" else default,
            "flags": [x.strip() for x in flags.split(",") if x.strip()],
            "desc": desc,
        }

# --- ArminC md: Name | Flags | Description ("Default: X<br>desc")
arm = {}
with open(ARM, encoding="utf-8", errors="replace") as f:
    for line in f.read().splitlines()[2:]:
        parts = line.split(" | ")
        if len(parts) < 2:
            continue
        name = parts[0].strip()
        flags = [x.strip() for x in parts[1].split(",") if x.strip()]
        rest = parts[2] if len(parts) > 2 else ""
        default = None
        m = re.match(r"Default:\s*(.*?)(?:<br>(.*))?$", rest, re.S)
        if m:
            default = html.unescape(m.group(1)).strip()
            desc = m.group(2) or ""
        else:
            desc = rest
        arm[name] = {"default": default, "flags": flags, "desc": desc}

names = sorted(set(arm) | set(sug), key=lambda s: s.lower())
out = []
stats = {"release": 0, "hidden": 0, "dev": 0, "cmd": 0, "cvar": 0, "cheat": 0}
for name in names:
    a = arm.get(name)
    s = sug.get(name)
    base = a or s
    default = base["default"]
    if default is None and s and s["default"] is not None:
        default = s["default"]
    desc = clean(base["desc"]) or clean((s or {}).get("desc", "")) or clean((a or {}).get("desc", ""))
    flags = set((a or {})["flags"] if a else []) | set((s or {})["flags"] if s else [])
    # normalizacja nazw flag
    norm = set()
    for fl in flags:
        fl = {"devonly": "devonly", "a": "archive", "rep": "replicated", "nf": "notify", "sv": "server", "cl": "client",
              "user": "userinfo", "prot": "protected", "norecord": "norecord"}.get(fl, fl)
        if fl.startswith("missing"):
            continue
        norm.add(fl)
    if "devonly" in norm:
        vis = "dev"
    elif "release" in norm and "hidden" not in norm:
        vis = "release"
    else:
        vis = "hidden"
    kind = "cmd" if default is None else "cvar"
    entry = {
        "n": name,
        "k": kind,
        "d": default,
        "f": sorted(norm),
        "h": desc,
        "c": categorize(name),
        "v": vis,
        "src": ("a" if a else "") + ("s" if s else ""),
    }
    out.append(entry)
    stats[vis] += 1
    stats[kind] += 1
    if "cheat" in norm:
        stats["cheat"] += 1

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

meta = {"count": len(out), "stats": stats, "sources": [
    {"name": "ArmynC/ArminC-CS2-Cvars", "version": "1.40.7.9", "date": "2025-05-19"},
    {"name": "SuGolYolLom/CS2-Cvars-Cmds", "version": "1.40.5.1", "date": "2024-11-15"},
], "categories": CATEGORIES}
with open(os.path.join(ROOT, "src/data/commands.meta.json"), "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)

print("written", len(out), "entries ->", OUT)
print(json.dumps(stats))
from collections import Counter
print(Counter(e["c"] for e in out).most_common())
