import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Alias, CfgData, CfgFile, GenerateOptions, TabId } from "./types";
import { DEFAULT_OPTIONS } from "./generate";
import { uid } from "./utils";

export interface ToastMsg {
  id: string;
  text: string;
  kind: "ok" | "err" | "info";
}

export interface PresetLike {
  cvars?: Record<string, string>;
  binds?: { key: string; command: string }[];
  aliases?: Alias[];
  custom?: string[];
}

interface UIState {
  tab: TabId;
  selectedKey: string | null;
  /** komenda czekająca na przypisanie do klawisza (z zakładki Komendy) */
  pendingCommand: string | null;
  capture: boolean;
  toast: ToastMsg | null;
  showHidden: boolean;
  showDev: boolean;
}

export interface Store extends CfgData {
  options: GenerateOptions;
  files: CfgFile[];
  activeFileId: string | null;
  hydrated: boolean;
  ui: UIState;

  setCvar: (name: string, value: string) => void;
  removeCvar: (name: string) => void;
  setBind: (key: string, command: string) => void;
  removeBind: (key: string) => void;
  renameBindKey: (from: string, to: string) => void;
  addAlias: (alias: Alias) => void;
  removeAlias: (name: string) => void;
  addCustom: (line: string) => void;
  updateCustom: (index: number, line: string) => void;
  removeCustom: (index: number) => void;
  applyPreset: (p: PresetLike) => void;
  replaceData: (data: CfgData, opts?: Partial<GenerateOptions>) => void;
  mergeData: (data: CfgData, opts?: Partial<GenerateOptions>) => void;
  resetAll: () => void;
  setOption: <K extends keyof GenerateOptions>(key: K, value: GenerateOptions[K]) => void;

  createFile: (name: string, content: string) => string;
  updateFile: (id: string, patch: Partial<Pick<CfgFile, "name" | "content">>) => void;
  deleteFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;

  setTab: (tab: TabId) => void;
  selectKey: (key: string | null) => void;
  setPendingCommand: (cmd: string | null) => void;
  setCapture: (on: boolean) => void;
  toast: (text: string, kind?: ToastMsg["kind"]) => void;
  clearToast: () => void;
  setShowHidden: (v: boolean) => void;
  setShowDev: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
}

const emptyData = (): CfgData => ({ cvars: {}, binds: {}, aliases: [], custom: [] });

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...emptyData(),
      options: { ...DEFAULT_OPTIONS },
      files: [],
      activeFileId: null,
      hydrated: false,
      ui: {
        tab: "settings",
        selectedKey: null,
        pendingCommand: null,
        capture: false,
        toast: null,
        showHidden: true,
        showDev: false,
      },

      setCvar: (name, value) => set((s) => ({ cvars: { ...s.cvars, [name]: value } })),
      removeCvar: (name) =>
        set((s) => {
          const cvars = { ...s.cvars };
          delete cvars[name];
          return { cvars };
        }),
      setBind: (key, command) => set((s) => ({ binds: { ...s.binds, [key]: command } })),
      removeBind: (key) =>
        set((s) => {
          const binds = { ...s.binds };
          delete binds[key];
          return { binds };
        }),
      renameBindKey: (from, to) =>
        set((s) => {
          if (from === to) return {};
          const binds = { ...s.binds };
          const cmd = binds[from];
          delete binds[from];
          if (cmd !== undefined) binds[to] = cmd;
          return { binds };
        }),
      addAlias: (alias) =>
        set((s) => ({ aliases: [...s.aliases.filter((a) => a.name !== alias.name), alias] })),
      removeAlias: (name) => set((s) => ({ aliases: s.aliases.filter((a) => a.name !== name) })),
      addCustom: (line) =>
        set((s) => (s.custom.includes(line) ? {} : { custom: [...s.custom, line] })),
      updateCustom: (index, line) =>
        set((s) => ({ custom: s.custom.map((l, i) => (i === index ? line : l)) })),
      removeCustom: (index) => set((s) => ({ custom: s.custom.filter((_, i) => i !== index) })),
      applyPreset: (p) =>
        set((s) => {
          const binds = { ...s.binds };
          for (const b of p.binds ?? []) binds[b.key] = b.command;
          const aliases = [...s.aliases];
          for (const a of p.aliases ?? []) {
            const i = aliases.findIndex((x) => x.name === a.name);
            if (i >= 0) aliases[i] = a;
            else aliases.push(a);
          }
          const custom = [...s.custom];
          for (const l of p.custom ?? []) if (!custom.includes(l)) custom.push(l);
          return { cvars: { ...s.cvars, ...(p.cvars ?? {}) }, binds, aliases, custom };
        }),
      replaceData: (data, opts) =>
        set((s) => ({
          cvars: { ...data.cvars },
          binds: { ...data.binds },
          aliases: [...data.aliases],
          custom: [...data.custom],
          options: { ...s.options, ...(opts ?? {}) },
        })),
      mergeData: (data, opts) =>
        set((s) => {
          const aliases = [...s.aliases];
          for (const a of data.aliases) {
            const i = aliases.findIndex((x) => x.name === a.name);
            if (i >= 0) aliases[i] = a;
            else aliases.push(a);
          }
          const custom = [...s.custom];
          for (const l of data.custom) if (!custom.includes(l)) custom.push(l);
          return {
            cvars: { ...s.cvars, ...data.cvars },
            binds: { ...s.binds, ...data.binds },
            aliases,
            custom,
            options: { ...s.options, ...(opts ?? {}) },
          };
        }),
      resetAll: () => set({ ...emptyData(), options: { ...DEFAULT_OPTIONS } }),
      setOption: (key, value) => set((s) => ({ options: { ...s.options, [key]: value } })),

      createFile: (name, content) => {
        const id = uid();
        set((s) => ({
          files: [...s.files, { id, name, content, updatedAt: Date.now() }],
          activeFileId: id,
        }));
        return id;
      },
      updateFile: (id, patch) =>
        set((s) => ({
          files: s.files.map((f) => (f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f)),
        })),
      deleteFile: (id) =>
        set((s) => {
          const files = s.files.filter((f) => f.id !== id);
          return { files, activeFileId: s.activeFileId === id ? (files[0]?.id ?? null) : s.activeFileId };
        }),
      setActiveFile: (id) => set({ activeFileId: id }),

      setTab: (tab) => set((s) => ({ ui: { ...s.ui, tab } })),
      selectKey: (key) => set((s) => ({ ui: { ...s.ui, selectedKey: key, capture: false } })),
      setPendingCommand: (cmd) => set((s) => ({ ui: { ...s.ui, pendingCommand: cmd } })),
      setCapture: (on) => set((s) => ({ ui: { ...s.ui, capture: on } })),
      toast: (text, kind = "ok") => {
        const id = uid();
        set((s) => ({ ui: { ...s.ui, toast: { id, text, kind } } }));
        setTimeout(() => {
          if (get().ui.toast?.id === id) set((s) => ({ ui: { ...s.ui, toast: null } }));
        }, 2600);
      },
      clearToast: () => set((s) => ({ ui: { ...s.ui, toast: null } })),
      setShowHidden: (v) => set((s) => ({ ui: { ...s.ui, showHidden: v } })),
      setShowDev: (v) => set((s) => ({ ui: { ...s.ui, showDev: v } })),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "cfghelper:v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        cvars: s.cvars,
        binds: s.binds,
        aliases: s.aliases,
        custom: s.custom,
        options: s.options,
        files: s.files,
        activeFileId: s.activeFileId,
        ui: { showHidden: s.ui.showHidden, showDev: s.ui.showDev, tab: s.ui.tab },
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Store>;
        return {
          ...current,
          ...p,
          options: { ...current.options, ...(p.options ?? {}) },
          ui: { ...current.ui, ...(p.ui ?? {}) },
        };
      },
    },
  ),
);

/** Selektor danych cfg (bez akcji) – do generatora. */
export function selectData(s: Store): CfgData {
  return { cvars: s.cvars, binds: s.binds, aliases: s.aliases, custom: s.custom };
}
