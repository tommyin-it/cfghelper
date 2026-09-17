/**
 * Układ klawiatury (ANSI) + mysz, z nazwami klawiszy w formacie CS2 (Source 2).
 * `id` = nazwa klawisza używana w `bind`, `codes` = KeyboardEvent.code w przeglądarce.
 */
export interface KeyDef {
  id: string;
  label: string;
  /** szerokość w jednostkach (1 = zwykły klawisz) */
  w?: number;
  /** wysokość w jednostkach (numpad +/enter) */
  h?: number;
  codes?: string[];
  /** klawisz zarezerwowany przez grę – nie da się go sensownie zbindować */
  disabled?: boolean;
  /** dodatkowa etykieta (np. shift-znak) */
  sub?: string;
}

export const FN_ROW: KeyDef[] = [
  { id: "escape", label: "Esc", codes: ["Escape"], disabled: true, w: 1 },
  { id: "__gap1", label: "", w: 1 },
  { id: "f1", label: "F1", codes: ["F1"] },
  { id: "f2", label: "F2", codes: ["F2"] },
  { id: "f3", label: "F3", codes: ["F3"] },
  { id: "f4", label: "F4", codes: ["F4"] },
  { id: "__gap2", label: "", w: 0.5 },
  { id: "f5", label: "F5", codes: ["F5"] },
  { id: "f6", label: "F6", codes: ["F6"] },
  { id: "f7", label: "F7", codes: ["F7"] },
  { id: "f8", label: "F8", codes: ["F8"] },
  { id: "__gap3", label: "", w: 0.5 },
  { id: "f9", label: "F9", codes: ["F9"] },
  { id: "f10", label: "F10", codes: ["F10"] },
  { id: "f11", label: "F11", codes: ["F11"] },
  { id: "f12", label: "F12", codes: ["F12"] },
];

export const MAIN_ROWS: KeyDef[][] = [
  [
    { id: "`", label: "`", sub: "~", codes: ["Backquote"] },
    { id: "1", label: "1", sub: "!", codes: ["Digit1"] },
    { id: "2", label: "2", sub: "@", codes: ["Digit2"] },
    { id: "3", label: "3", sub: "#", codes: ["Digit3"] },
    { id: "4", label: "4", sub: "$", codes: ["Digit4"] },
    { id: "5", label: "5", sub: "%", codes: ["Digit5"] },
    { id: "6", label: "6", sub: "^", codes: ["Digit6"] },
    { id: "7", label: "7", sub: "&", codes: ["Digit7"] },
    { id: "8", label: "8", sub: "*", codes: ["Digit8"] },
    { id: "9", label: "9", sub: "(", codes: ["Digit9"] },
    { id: "0", label: "0", sub: ")", codes: ["Digit0"] },
    { id: "-", label: "-", sub: "_", codes: ["Minus"] },
    { id: "=", label: "=", sub: "+", codes: ["Equal"] },
    { id: "backspace", label: "Backspace", w: 2, codes: ["Backspace"] },
  ],
  [
    { id: "tab", label: "Tab", w: 1.5, codes: ["Tab"] },
    { id: "q", label: "Q", codes: ["KeyQ"] },
    { id: "w", label: "W", codes: ["KeyW"] },
    { id: "e", label: "E", codes: ["KeyE"] },
    { id: "r", label: "R", codes: ["KeyR"] },
    { id: "t", label: "T", codes: ["KeyT"] },
    { id: "y", label: "Y", codes: ["KeyY"] },
    { id: "u", label: "U", codes: ["KeyU"] },
    { id: "i", label: "I", codes: ["KeyI"] },
    { id: "o", label: "O", codes: ["KeyO"] },
    { id: "p", label: "P", codes: ["KeyP"] },
    { id: "[", label: "[", sub: "{", codes: ["BracketLeft"] },
    { id: "]", label: "]", sub: "}", codes: ["BracketRight"] },
    { id: "\\", label: "\\", sub: "|", w: 1.5, codes: ["Backslash"] },
  ],
  [
    { id: "capslock", label: "Caps Lock", w: 1.75, codes: ["CapsLock"] },
    { id: "a", label: "A", codes: ["KeyA"] },
    { id: "s", label: "S", codes: ["KeyS"] },
    { id: "d", label: "D", codes: ["KeyD"] },
    { id: "f", label: "F", codes: ["KeyF"] },
    { id: "g", label: "G", codes: ["KeyG"] },
    { id: "h", label: "H", codes: ["KeyH"] },
    { id: "j", label: "J", codes: ["KeyJ"] },
    { id: "k", label: "K", codes: ["KeyK"] },
    { id: "l", label: "L", codes: ["KeyL"] },
    { id: "semicolon", label: ";", sub: ":", codes: ["Semicolon"] },
    { id: "'", label: "'", sub: "\"", codes: ["Quote"] },
    { id: "enter", label: "Enter", w: 2.25, codes: ["Enter"] },
  ],
  [
    { id: "shift", label: "Shift", w: 2.25, codes: ["ShiftLeft"] },
    { id: "z", label: "Z", codes: ["KeyZ"] },
    { id: "x", label: "X", codes: ["KeyX"] },
    { id: "c", label: "C", codes: ["KeyC"] },
    { id: "v", label: "V", codes: ["KeyV"] },
    { id: "b", label: "B", codes: ["KeyB"] },
    { id: "n", label: "N", codes: ["KeyN"] },
    { id: "m", label: "M", codes: ["KeyM"] },
    { id: ",", label: ",", sub: "<", codes: ["Comma"] },
    { id: ".", label: ".", sub: ">", codes: ["Period"] },
    { id: "/", label: "/", sub: "?", codes: ["Slash"] },
    { id: "rshift", label: "Shift", w: 2.75, codes: ["ShiftRight"] },
  ],
  [
    { id: "ctrl", label: "Ctrl", w: 1.25, codes: ["ControlLeft"] },
    { id: "lwin", label: "Win", w: 1.25, codes: ["MetaLeft", "OSLeft"] },
    { id: "alt", label: "Alt", w: 1.25, codes: ["AltLeft"] },
    { id: "space", label: "Spacja", w: 6.25, codes: ["Space"] },
    { id: "ralt", label: "Alt", w: 1.25, codes: ["AltRight"] },
    { id: "rwin", label: "Win", w: 1.25, codes: ["MetaRight", "OSRight"] },
    { id: "app", label: "Menu", w: 1.25, codes: ["ContextMenu"] },
    { id: "rctrl", label: "Ctrl", w: 1.25, codes: ["ControlRight"] },
  ],
];

export const NAV_ROWS: KeyDef[][] = [
  [
    { id: "ins", label: "Ins", codes: ["Insert"] },
    { id: "home", label: "Home", codes: ["Home"] },
    { id: "pgup", label: "PgUp", codes: ["PageUp"] },
  ],
  [
    { id: "del", label: "Del", codes: ["Delete"] },
    { id: "end", label: "End", codes: ["End"] },
    { id: "pgdn", label: "PgDn", codes: ["PageDown"] },
  ],
];

export const SYS_ROW: KeyDef[] = [
  { id: "printscreen", label: "PrtSc", codes: ["PrintScreen"], disabled: true },
  { id: "scrolllock", label: "ScrLk", codes: ["ScrollLock"] },
  { id: "pause", label: "Pause", codes: ["Pause"] },
];

export const ARROW_ROWS: KeyDef[][] = [
  [
    { id: "__gapA", label: "", w: 1 },
    { id: "uparrow", label: "↑", codes: ["ArrowUp"] },
    { id: "__gapB", label: "", w: 1 },
  ],
  [
    { id: "leftarrow", label: "←", codes: ["ArrowLeft"] },
    { id: "downarrow", label: "↓", codes: ["ArrowDown"] },
    { id: "rightarrow", label: "→", codes: ["ArrowRight"] },
  ],
];

export const NUMPAD_ROWS: KeyDef[][] = [
  [
    { id: "numlock", label: "Num", codes: ["NumLock"] },
    { id: "kp_slash", label: "/", codes: ["NumpadDivide"] },
    { id: "kp_multiply", label: "*", codes: ["NumpadMultiply"] },
    { id: "kp_minus", label: "-", codes: ["NumpadSubtract"] },
  ],
  [
    { id: "kp_home", label: "7", sub: "Home", codes: ["Numpad7"] },
    { id: "kp_uparrow", label: "8", sub: "↑", codes: ["Numpad8"] },
    { id: "kp_pgup", label: "9", sub: "PgUp", codes: ["Numpad9"] },
    { id: "kp_plus", label: "+", h: 2, codes: ["NumpadAdd"] },
  ],
  [
    { id: "kp_leftarrow", label: "4", sub: "←", codes: ["Numpad4"] },
    { id: "kp_5", label: "5", codes: ["Numpad5"] },
    { id: "kp_rightarrow", label: "6", sub: "→", codes: ["Numpad6"] },
  ],
  [
    { id: "kp_end", label: "1", sub: "End", codes: ["Numpad1"] },
    { id: "kp_downarrow", label: "2", sub: "↓", codes: ["Numpad2"] },
    { id: "kp_pgdn", label: "3", sub: "PgDn", codes: ["Numpad3"] },
    { id: "kp_enter", label: "Enter", h: 2, codes: ["NumpadEnter"] },
  ],
  [
    { id: "kp_ins", label: "0", sub: "Ins", w: 2, codes: ["Numpad0"] },
    { id: "kp_del", label: ".", sub: "Del", codes: ["NumpadDecimal"] },
  ],
];

export const MOUSE_KEYS: KeyDef[] = [
  { id: "mouse1", label: "LPM", sub: "mouse1" },
  { id: "mouse2", label: "PPM", sub: "mouse2" },
  { id: "mouse3", label: "Środkowy", sub: "mouse3" },
  { id: "mwheelup", label: "Kółko ↑", sub: "mwheelup" },
  { id: "mwheeldown", label: "Kółko ↓", sub: "mwheeldown" },
  { id: "mouse4", label: "Boczny 1", sub: "mouse4" },
  { id: "mouse5", label: "Boczny 2", sub: "mouse5" },
];

export const ALL_KEYS: KeyDef[] = [
  ...FN_ROW,
  ...MAIN_ROWS.flat(),
  ...NAV_ROWS.flat(),
  ...SYS_ROW,
  ...ARROW_ROWS.flat(),
  ...NUMPAD_ROWS.flat(),
  ...MOUSE_KEYS,
].filter((k) => !k.id.startsWith("__"));

export const KEY_BY_ID: Record<string, KeyDef> = Object.fromEntries(ALL_KEYS.map((k) => [k.id, k]));

export const CODE_TO_KEY: Record<string, string> = Object.fromEntries(
  ALL_KEYS.flatMap((k) => (k.codes ?? []).map((c) => [c, k.id])),
);

/** Wszystkie nazwy klawiszy, które można wybrać w selectach. */
export const BINDABLE_KEY_IDS: string[] = ALL_KEYS.filter((k) => !k.disabled).map((k) => k.id);

export function keyLabel(id: string): string {
  const k = KEY_BY_ID[id];
  if (!k) return id;
  if (k.sub && id.startsWith("kp_")) return `Num ${k.label}`;
  if (id.startsWith("mouse") || id.startsWith("mwheel")) return `${k.label} (${id})`;
  if (id === "rshift" || id === "rctrl" || id === "ralt" || id === "rwin") return `Prawy ${k.label}`;
  if (id === "shift" || id === "ctrl" || id === "alt" || id === "lwin") return `Lewy ${k.label}`;
  return k.label;
}

export function keyFromMouseButton(button: number): string | null {
  switch (button) {
    case 0:
      return "mouse1";
    case 2:
      return "mouse2";
    case 1:
      return "mouse3";
    case 3:
      return "mouse4";
    case 4:
      return "mouse5";
    default:
      return null;
  }
}

/** Aliasy nazw klawiszy spotykane w cfg (np. z CS:GO) → nazwa kanoniczna. */
const KEY_ALIASES: Record<string, string> = {
  ";": "semicolon",
  esc: "escape",
  return: "enter",
  lshift: "shift",
  lctrl: "ctrl",
  lalt: "alt",
  insert: "ins",
  delete: "del",
  pageup: "pgup",
  pagedown: "pgdn",
  up: "uparrow",
  down: "downarrow",
  left: "leftarrow",
  right: "rightarrow",
  kp_0: "kp_ins",
  kp_1: "kp_end",
  kp_2: "kp_downarrow",
  kp_3: "kp_pgdn",
  kp_4: "kp_leftarrow",
  kp_6: "kp_rightarrow",
  kp_7: "kp_home",
  kp_8: "kp_uparrow",
  kp_9: "kp_pgup",
  kp_period: "kp_del",
  kp_divide: "kp_slash",
  kp_add: "kp_plus",
  kp_subtract: "kp_minus",
  mouse_wheel_up: "mwheelup",
  mouse_wheel_down: "mwheeldown",
  win: "lwin",
};

export function normalizeKeyName(raw: string): string {
  const s = raw.trim().replace(/^"|"$/g, "").toLowerCase();
  return KEY_ALIASES[s] ?? s;
}
