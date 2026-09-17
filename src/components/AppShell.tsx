"use client";
import { useEffect, useState } from "react";
import { Keyboard as KeyboardIcon, Settings2, Sparkles, Terminal, FileCode2, CircleHelp, FileText, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { decodeShare } from "@/lib/share";
import type { TabId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SettingsTab } from "./settings/SettingsTab";
import { BindsTab } from "./binds/BindsTab";
import { PresetsTab } from "./presets/PresetsTab";
import { CommandsTab } from "./commands/CommandsTab";
import { EditorTab } from "./editor/EditorTab";
import { HelpTab } from "./help/HelpTab";
import { PreviewPanel } from "./PreviewPanel";
import { Toast } from "./Toast";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "settings", label: "Ustawienia", icon: Settings2 },
  { id: "binds", label: "Bindy", icon: KeyboardIcon },
  { id: "presets", label: "Polecane", icon: Sparkles },
  { id: "commands", label: "Komendy", icon: Terminal },
  { id: "editor", label: "Edytor", icon: FileCode2 },
  { id: "help", label: "Instalacja", icon: CircleHelp },
];

export function AppShell() {
  const hydrated = useStore((s) => s.hydrated);
  const tab = useStore((s) => s.ui.tab);
  const setTab = useStore((s) => s.setTab);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    useStore.persist.rehydrate();
    useStore.getState().setHydrated(true);
    const tabParam = new URLSearchParams(window.location.search).get("tab") as TabId | null;
    if (tabParam && TABS.some((t) => t.id === tabParam)) useStore.getState().setTab(tabParam);
    const h = window.location.hash;
    if (h.length > 2) {
      decodeShare(h).then((p) => {
        if (!p) return;
        const st = useStore.getState();
        const hasData = Object.keys(st.cvars).length + Object.keys(st.binds).length + st.custom.length > 0;
        if (!hasData || window.confirm("Link zawiera config. Zastąpić bieżący config danymi z linku?")) {
          st.replaceData(p.d, p.o);
          st.toast("Wczytano config z linku");
        }
        history.replaceState(null, "", window.location.pathname + window.location.search);
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto max-w-[1700px] px-3 sm:px-5 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-md bg-accent text-[#1a1200] font-black flex items-center justify-center text-sm">
              CFG
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">CFG Helper</div>
              <div className="text-[10px] text-muted -mt-0.5">generator autoexec.cfg · CS2</div>
            </div>
          </div>
          <nav className="flex-1 flex items-center gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  tab === t.id ? "bg-panel3 text-accent-hi" : "text-muted hover:text-text hover:bg-panel2",
                )}
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>
          <button
            onClick={() => setPreviewOpen(true)}
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-medium bg-panel2 border border-border2 text-text",
              tab !== "editor" && "xl:hidden",
            )}
          >
            <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Podgląd cfg</span>
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-[1700px] px-3 sm:px-5 py-4">
        {!hydrated ? (
          <div className="text-muted text-sm py-20 text-center">Ładowanie…</div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 gap-4",
              tab !== "editor" && "xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_460px]",
            )}
          >
            <div className="min-w-0 fade-in" key={tab}>
              {tab === "settings" && <SettingsTab />}
              {tab === "binds" && <BindsTab />}
              {tab === "presets" && <PresetsTab />}
              {tab === "commands" && <CommandsTab />}
              {tab === "editor" && <EditorTab />}
              {tab === "help" && <HelpTab />}
            </div>
            {tab !== "editor" && (
              <aside className="hidden xl:block">
                <div className="sticky top-[4.5rem] max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-1">
                  <PreviewPanel />
                </div>
              </aside>
            )}
          </div>
        )}
      </main>

      {previewOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-bg border-l border-border overflow-y-auto p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button onClick={() => setPreviewOpen(false)} className="text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <PreviewPanel />
          </div>
        </div>
      )}

      <footer className="border-t border-border mt-6">
        <div className="mx-auto max-w-[1700px] px-3 sm:px-5 py-4 text-[11px] text-muted flex flex-wrap gap-x-4 gap-y-1">
          <span>CFG Helper – 100% w przeglądarce, dane zapisywane lokalnie (localStorage).</span>
          <span>
            Baza komend: ArminC-CS2-Cvars (1.40.7.9, 05.2025) + SuGolYolLom/CS2-Cvars-Cmds (1.40.5.1, 11.2024).
          </span>
          <a className="hover:text-text underline decoration-border2" href="https://github.com/tommyin-it/cfghelper" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </footer>
      <Toast />
    </div>
  );
}
