import type { SettingCategory } from "./types";

/** Kolejność i etykiety kategorii bazy komend (zgodne ze scripts/build-commands.py). */
export const COMMAND_CATEGORIES: SettingCategory[] = [
  { id: "radar", label: "Radar" },
  { id: "viewmodel", label: "Viewmodel" },
  { id: "hud", label: "HUD i interfejs gry" },
  { id: "input", label: "Mysz i sterowanie" },
  { id: "audio", label: "Dźwięk" },
  { id: "video", label: "Wideo i wydajność" },
  { id: "network", label: "Sieć i matchmaking" },
  { id: "crosshair", label: "Celownik" },
  { id: "actions", label: "Akcje (+/-)" },
  { id: "scripting", label: "Bindy i skrypty" },
  { id: "server", label: "Serwer i rozgrywka" },
  { id: "bots", label: "Boty i nawigacja" },
  { id: "demo", label: "Demo i GOTV" },
  { id: "ui", label: "Menu i UI" },
  { id: "client", label: "Klient (inne)" },
  { id: "dev", label: "Debug i deweloperskie" },
  { id: "other", label: "Inne" },
];

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  COMMAND_CATEGORIES.map((c) => [c.id, c.label]),
);

const RULES: [RegExp, string][] = [
  [/^[+-]/, "actions"],
  [
    /^(bind|unbind|unbindall|alias|exec|echo|toggle|incrementvar|multvar|key_|bindtoggle|cvarlist|find|help|host_writeconfig|con_|toggleconsole|clear$|quit$|disconnect$|exit$)/i,
    "scripting",
  ],
  [/^(cl_radar_|cl_hud_radar)/, "radar"],
  [/^(cl_crosshair|crosshair)/, "crosshair"],
  [/^(viewmodel_|cl_viewmodel|cl_wpn_sway|cl_bob|cl_righthand|switchhands)/, "viewmodel"],
  [/^(m_|sensitivity|zoom_sensitivity|joy_|joystick|input_|option_|cl_scoreboard_mouse)/, "input"],
  [/^(snd_|volume$|voice_|cc_|dsp_|sound|steamaudio|cl_embedded_stream_audio|adsp_)/, "audio"],
  [
    /^(cl_hud_|hud_|safezone|cl_teamid|cl_teammate|cl_show|cl_draw|cl_deathnotice|cl_scoreboard|cl_color|cl_clanid|cl_sanitize|cl_playerspray|cl_spraysay|cl_hide|cl_display|cl_obs_|cl_spec|spec_|cl_grenadecrosshair|cl_quickinventory|cl_use_opens|cl_buywheel|cl_dm_|cl_autohelp|cl_prefer_lefthanded|cl_silencer|cl_player_ping|cl_mute|gameinstructor)/,
    "hud",
  ],
  [
    /^(net_|rate$|cl_interp|cl_net_|cl_tickpacket|cl_clock|cl_timeout|cl_resend|cl_lagcomp|cl_predict|cl_cmdrate|cl_updaterate|sv_maxrate|sv_minrate|sv_maxupdaterate|sv_minupdaterate|mm_|ui_playsettings|steam_|sdr|cl_join_advertise|cl_invites|matchmaking|lobby|party_)/,
    "network",
  ],
  [
    /^(r_|mat_|fps_|engine_|video|csm_|fog_|particle|cloth_|lb_|sc_|sparseshadowtree|vis_|gpu|dx|vulkan|shader|texture|lightmap|dynamic_|cl_ragdoll|ragdoll_|cl_jiggle|cl_particle|cl_phys|cl_decal|cl_ent_)/,
    "video",
  ],
  [
    /^(mp_|sv_|game_|ammo_|cash_|weapon_|inferno_|molotov|contributionscore_|healthshot|cs_|csgo_|ff_|tr_|mapoverview|map_|changelevel|map$|maps$)/,
    "server",
  ],
  [/^(bot_|nav_)/, "bots"],
  [/^(tv_|demo_|demo|record$|stop$|playdemo|listdemo|cl_demo)/, "demo"],
  [/^(ui_|cl_mainmenu|cl_inventory|cl_loadout|cl_borderless|cl_compass|cl_menu|panorama_|cachedvalue_|cl_promo|cl_news)/, "ui"],
  [
    /^(ent_|phys_|animgraph_|ik_|script_|imgui_|vprof_|debug_|dev_|ai_|npc|prop_|save_|test|log_|mem_|thread|vprof|prof_|dump|print|report_|sv_debug|cl_debug|physics|phys|scene|soundscape|tools|vconsole|cl_showerror|developer|con_)/,
    "dev",
  ],
  [/^cl_/, "client"],
];

export function categorize(name: string): string {
  for (const [rx, cat] of RULES) {
    if (rx.test(name)) return cat;
  }
  return "other";
}
