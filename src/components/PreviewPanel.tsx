"use client";
import { useMemo, useState, type CSSProperties } from "react";
import { Download, Save, Share2, Trash2, Lightbulb, TriangleAlert, ChevronDown, Check, Settings2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { generateCfg } from "@/lib/generate";
import { getSuggestions } from "@/lib/suggestions";
import { encodeShare } from "@/lib/share";
import { SETTINGS } from "@/data/settings";
import { copyText, downloadText, cn } from "@/lib/utils";
import { highlightCfg } from "./editor/CodeEditor";
import { Button, Card, CopyButton, IconButton, IconSwap, Toggle } from "./ui/ui";

export function useCfgText() {
  const cvars = useStore((s) => s.cvars);
  const binds = useStore((s) => s.binds);
  const aliases = useStore((s) => s.aliases);
  const custom = useStore((s) => s.custom);
  const options = useStore((s) => s.options);
  const data = useMemo(() => ({ cvars, binds, aliases, custom }), [cvars, binds, aliases, custom]);
  const text = useMemo(() => generateCfg(data, options, SETTINGS), [data, options]);
  return { data, options, text };
}

/**
 * Panel po prawej: generowany config na pierwszym planie (wypełnia wysokość przy `fill`),
 * sugestie zwinięte do paska pod spodem.
 */
export function PreviewPanel({ fill }: { fill?: boolean }) {
  const { data, options, text } = useCfgText();
  const setOption = useStore((s) => s.setOption);
  const resetAll = useStore((s) => s.resetAll);
  const createFile = useStore((s) => s.createFile);
  const setTab = useStore((s) => s.setTab);
  const applyPreset = useStore((s) => s.applyPreset);
  const toast = useStore((s) => s.toast);
  const [showOptions, setShowOptions] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [sugOpen, setSugOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const suggestions = useMemo(() => getSuggestions(data).filter((s) => !dismissed.has(s.id)), [data, dismissed]);
  const warns = suggestions.filter((s) => s.kind === "warn");
  const tips = suggestions.filter((s) => s.kind === "tip");
  const html = useMemo(() => highlightCfg(text), [text]);
  const lines = useMemo(() => text.split("\n").length, [text]);

  const stats = {
    cvars: Object.keys(data.cvars).length,
    binds: Object.values(data.binds).filter(Boolean).length,
    aliases: data.aliases.length,
    custom: data.custom.length,
  };

  const onDownload = () => {
    downloadText("autoexec.cfg", text);
    toast("Pobieranie autoexec.cfg");
  };
  const onSave = () => {
    const name = window.prompt("Nazwa pliku:", "autoexec.cfg");
    if (!name) return;
    createFile(name.endsWith(".cfg") ? name : `${name}.cfg`, text);
    setTab("editor");
    toast(`Zapisano jako ${name}`);
  };
  const onShare = async () => {
    const hash = await encodeShare(data, options);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    if (await copyText(url)) {
      setShared(true);
      setTimeout(() => setShared(false), 1400);
      toast("Link do configu skopiowany");
    } else toast("Nie udało się skopiować linku", "err");
  };
  const onReset = () => {
    if (window.confirm("Wyczyścić cały config (ustawienia, bindy, aliasy)? Zapisane pliki w Edytorze zostaną.")) {
      resetAll();
      toast("Config wyczyszczony", "info");
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", fill && "h-full min-h-0")}>
      <Card className={cn("p-3 flex flex-col gap-2.5", fill && "flex-1 min-h-0")}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold tracking-tight">autoexec.cfg</div>
            <div className="text-[11px] text-muted tnum">
              {lines} linii · {stats.cvars} cvar · {stats.binds} bind · {stats.aliases} alias · {stats.custom} własne
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconButton onClick={() => setShowOptions(!showOptions)} title="Opcje generowania" aria-expanded={showOptions} aria-label="Opcje generowania">
              <Settings2 className="h-4 w-4" strokeWidth={1.75} />
            </IconButton>
            <IconButton tone="danger" onClick={onReset} title="Wyczyść config" aria-label="Wyczyść config">
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </IconButton>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button variant="primary" icon onClick={onDownload}>
            <Download className="h-3.5 w-3.5" /> Pobierz
          </Button>
          <CopyButton text={() => text} onCopied={(ok) => !ok && toast("Nie udało się skopiować", "err")} />
          <Button icon onClick={onSave} title="Zapisz jako plik w Edytorze (localStorage)">
            <Save className="h-3.5 w-3.5" /> Do edytora
          </Button>
          <Button icon onClick={onShare} title="Skopiuj link z całym configiem zakodowanym w adresie">
            <IconSwap active={shared} a={<Share2 className="h-3.5 w-3.5" />} b={<Check className="h-3.5 w-3.5 text-ok" />} />
            <span key={shared ? "d" : "s"} className="swap">
              {shared ? "Skopiowano" : "Link"}
            </span>
          </Button>
        </div>
        {showOptions && (
          <div className="pop-in grid grid-cols-2 gap-x-3 gap-y-2 rounded-md bg-panel2 p-2.5">
            <Toggle checked={options.header} onChange={(v) => setOption("header", v)} label="Nagłówek" />
            <Toggle checked={options.comments} onChange={(v) => setOption("comments", v)} label="Komentarze" />
            <Toggle checked={options.hostWriteconfig} onChange={(v) => setOption("hostWriteconfig", v)} label="host_writeconfig" />
            <Toggle checked={options.echo} onChange={(v) => setOption("echo", v)} label="echo na końcu" />
            <Toggle checked={options.unbindall} onChange={(v) => setOption("unbindall", v)} label="unbindall na start" className="col-span-2" />
            {options.unbindall && (
              <div className="pop-in col-span-2 text-[11px] text-warn">
                Uwaga: unbindall usuwa WSZYSTKIE bindy z gry – musisz mieć w cfg także ruch, strzał, itd.
              </div>
            )}
          </div>
        )}
        <pre
          className={cn(
            "cfg-pre rounded-md bg-panel2 p-3 overflow-auto whitespace-pre shadow-[inset_0_0_0_1px_var(--color-border)]",
            fill ? "flex-1 min-h-0" : "max-h-[60vh]",
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Card>

      {(warns.length > 0 || tips.length > 0) && (
        <Card className={cn("shrink-0 flex flex-col", fill && sugOpen && "max-h-[42%]")}>
          <button
            type="button"
            onClick={() => setSugOpen(!sugOpen)}
            aria-expanded={sugOpen}
            className="btn btn-static flex items-center gap-2 px-3 py-2.5 text-left rounded-lg hover:bg-panel2"
          >
            <Lightbulb className="h-4 w-4 text-accent shrink-0" strokeWidth={2} />
            <span className="text-[13px] font-semibold tracking-tight">Sugestie</span>
            <span className="text-[11px] text-muted tnum flex items-center gap-2 ml-1">
              {warns.length > 0 && (
                <span className="inline-flex items-center gap-1 text-warn font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-warn" /> {warns.length} ostrz.
                </span>
              )}
              {tips.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent2" /> {tips.length} podpowiedzi
                </span>
              )}
            </span>
            <ChevronDown className={cn("h-4 w-4 text-muted ml-auto shrink-0 transition-transform duration-150 ease-out", sugOpen && "rotate-180")} strokeWidth={1.75} />
          </button>
          {sugOpen && (
            <div className="pop-in px-2 pb-2 space-y-1.5 overflow-y-auto min-h-0 border-t border-border pt-2">
              {[...warns, ...tips].map((s, i) => (
                <div
                  key={s.id}
                  style={{ "--i": i } as CSSProperties}
                  className={cn("stagger-item rounded-md p-2.5 text-xs", s.kind === "warn" ? "bg-warn/5" : "bg-panel2")}
                >
                  <div className="flex items-start gap-2">
                    {s.kind === "warn" ? (
                      <TriangleAlert className="h-4 w-4 text-warn shrink-0 mt-0.5" strokeWidth={1.75} />
                    ) : (
                      <Lightbulb className="h-4 w-4 text-accent2 shrink-0 mt-0.5" strokeWidth={1.75} />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-text">{s.title}</div>
                      <div className="text-muted mt-0.5 leading-snug">{s.desc}</div>
                      <div className="flex gap-1.5 mt-2">
                        {s.apply && (
                          <Button
                            size="xs"
                            icon
                            variant={s.kind === "warn" ? "primary" : "default"}
                            onClick={() => {
                              applyPreset(s.apply!);
                              toast("Zastosowano");
                            }}
                          >
                            <Check className="h-3 w-3" /> {s.applyLabel ?? "Zastosuj"}
                          </Button>
                        )}
                        <Button size="xs" variant="ghost" onClick={() => setDismissed(new Set([...dismissed, s.id]))}>
                          Ukryj
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
