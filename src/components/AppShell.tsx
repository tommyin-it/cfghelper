"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Keyboard as KeyboardIcon, Settings2, Sparkles, Terminal, FileCode2, CircleHelp, FileText, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { decodeShare } from "@/lib/share";
import { usePresence } from "@/lib/usePresence";
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
  const drawer = usePresence(previewOpen, 200);
  const navRef = useRef<HTMLElement>(null);
  const [ind, setInd] = useState<{ x: number; w: number } | null>(null);

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

  // wskaźnik aktywnej zakładki – mierzymy pozycję i animujemy tylko transform
  useLayoutEffect(() => {
    const measure = () => {
      const el = navRef.current?.querySelector<HTMLElement>(`[data-tab="${tab}"]`);
      if (el) setInd({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tab, hydrated]);

  useEffect(() => {
    if (!drawer.mounted) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPreviewOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer.mounted]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-panel/85 backdrop-blur-md">
        <div className="mx-auto max-w-[1700px] px-3 sm:px-5 h-14 flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-accent text-white font-black flex items-center justify-center text-[11px] tracking-tight shadow-[0_1px_2px_rgba(242,109,27,0.35)]">
              CFG
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="text-[13px] font-semibold tracking-tight">CFG Helper</div>
              <div className="text-[10.5px] text-muted -mt-0.5">generator autoexec.cfg · CS2</div>
            </div>
          </div>
          <nav ref={navRef} className="relative flex-1 flex items-center gap-0.5 self-stretch overflow-x-auto" aria-label="Zakładki">
            {TABS.map((t) => (
              <button
                key={t.id}
                data-tab={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "btn relative flex items-center gap-1.5 h-full px-2.5 sm:px-3 text-[13px] font-medium whitespace-nowrap rounded-none",
                  "transition-colors duration-150 ease",
                  tab === t.id ? "text-text" : "text-muted hover:text-text",
                )}
              >
                <t.icon className={cn("h-4 w-4 transition-colors duration-150", tab === t.id ? "text-accent" : "text-muted/80")} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
            <span
              className="tab-indicator"
              style={{ transform: `translateX(${ind?.x ?? 0}px) scaleX(${ind?.w ?? 0})`, opacity: ind ? 1 : 0 }}
              aria-hidden
            />
          </nav>
          <button
            onClick={() => setPreviewOpen(true)}
            className={cn(
              "btn flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md text-xs font-medium bg-panel border border-border2 text-text hover:border-border3 hover:bg-panel2",
              tab !== "editor" && "xl:hidden",
            )}
            aria-label="Podgląd cfg"
            data-testid="open-preview"
          >
            <FileText className="h-4 w-4 text-muted" /> <span className="hidden sm:inline">Podgląd cfg</span>
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-[1700px] px-3 sm:px-5 py-5">
        {!hydrated ? (
          <div className="text-muted text-sm py-24 text-center">Ładowanie…</div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 gap-5",
              tab !== "editor" && "xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_460px]",
            )}
          >
            <div className="min-w-0 enter-fade" key={tab}>
              {tab === "settings" && <SettingsTab />}
              {tab === "binds" && <BindsTab />}
              {tab === "presets" && <PresetsTab />}
              {tab === "commands" && <CommandsTab />}
              {tab === "editor" && <EditorTab />}
              {tab === "help" && <HelpTab />}
            </div>
            {tab !== "editor" && (
              <aside className="hidden xl:block">
                <div className="sticky top-[4.75rem] max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
                  <PreviewPanel />
                </div>
              </aside>
            )}
          </div>
        )}
      </main>

      {drawer.mounted && (
        <div
          className="modal-backdrop fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
          data-closing={drawer.closing || undefined}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="drawer-panel absolute right-0 top-0 h-full w-full max-w-[520px] bg-bg border-l border-border overflow-y-auto p-3 shadow-[-12px_0_32px_rgba(20,20,30,0.08)]"
            data-closing={drawer.closing || undefined}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Podgląd cfg"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-[13px] font-semibold tracking-tight">Podgląd cfg</div>
              <button onClick={() => setPreviewOpen(false)} className="btn rounded-md p-1 text-muted hover:text-text hover:bg-panel3" aria-label="Zamknij">
                <X className="h-5 w-5" />
              </button>
            </div>
            <PreviewPanel />
          </div>
        </div>
      )}

      <footer className="border-t border-border mt-8 bg-panel/60">
        <div className="mx-auto max-w-[1700px] px-3 sm:px-5 py-4 text-[11.5px] text-muted flex flex-wrap gap-x-5 gap-y-1">
          <span>CFG Helper działa w 100% w przeglądarce, dane zapisuje lokalnie.</span>
          <span>Baza komend: ArminC-CS2-Cvars 1.40.7.9 (05.2025) + SuGolYolLom/CS2-Cvars-Cmds 1.40.5.1 (11.2024).</span>
          <a className="hover:text-text underline decoration-border3 underline-offset-2 transition-colors" href="https://github.com/tommyin-it/cfghelper" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </footer>
      <Toast />
    </div>
  );
}
