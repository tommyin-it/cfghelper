export type Visibility = "release" | "hidden" | "dev";

/** Wpis z bazy komend (skrócone klucze, bo plik ma ~5000 pozycji). */
export interface CommandEntry {
  /** nazwa */
  n: string;
  /** rodzaj: cmd = komenda, cvar = zmienna */
  k: "cmd" | "cvar";
  /** wartość domyślna (null dla komend) */
  d: string | null;
  /** flagi (archive, cheat, release, hidden, devonly, ...) */
  f: string[];
  /** opis (po angielsku, z gry) */
  h: string;
  /** kategoria (id) */
  c: string;
  /** widoczność: release / hidden / dev */
  v: Visibility;
  /** źródło: a = ArminC 2025, s = SuGol 2024, c = kuratorowane */
  src?: string;
}

export interface Alias {
  name: string;
  command: string;
}

export interface CfgData {
  cvars: Record<string, string>;
  binds: Record<string, string>;
  aliases: Alias[];
  custom: string[];
}

export interface CfgFile {
  id: string;
  name: string;
  content: string;
  updatedAt: number;
}

export interface GenerateOptions {
  header: boolean;
  comments: boolean;
  unbindall: boolean;
  hostWriteconfig: boolean;
  echo: boolean;
}

export type TabId = "settings" | "binds" | "presets" | "commands" | "editor" | "help";

export type SettingType = "bool" | "number" | "enum" | "string";

export interface SettingOption {
  value: string;
  label: string;
}

export interface SettingDef {
  name: string;
  label: string;
  desc: string;
  type: SettingType;
  category: string;
  default: string;
  recommended?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: SettingOption[];
  /** cvar niewidoczny w konsoli (bez flagi release) */
  hidden?: boolean;
  note?: string;
}

export interface SettingCategory {
  id: string;
  label: string;
  desc?: string;
}

export interface PresetBind {
  /** sugerowany klawisz; użytkownik może zmienić */
  key?: string;
  command: string;
  label: string;
}

export interface Preset {
  id: string;
  title: string;
  desc: string;
  category: string;
  tags?: string[];
  cvars?: Record<string, string>;
  binds?: PresetBind[];
  aliases?: Alias[];
  custom?: string[];
  note?: string;
  /** wymaga sv_cheats / serwera lokalnego */
  practice?: boolean;
}

export interface ActionDef {
  command: string;
  label: string;
  group: string;
  desc?: string;
}
