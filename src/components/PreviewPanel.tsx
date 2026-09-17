"use client";
import { useMemo, useState } from "react";
import { Copy, Download, Save, Share2, Trash2, Lightbulb, TriangleAlert, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { generateCfg } from "@/lib/generate";
import { getSuggestions } from "@/lib/suggestions";
import { encodeShare } from "@/lib/share";
import { SETTINGS } from "@/data/settings";
import { copyText, downloadText, cn } from "@/lib/utils";
import { Button, Card, SectionTitle, Toggle } from "./ui/ui";

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

export function PreviewPanel() {
  const { data, options, text } = useCfgText();
  const setOption = useStore((s) => s.setOption);
  const resetAll = useStore((s) => s.resetAll);
  const createFile = useStore((s) => s.createFile);
  const setTab = useStore((s) => s.setTab);
  const applyPreset = useStore((s) => s.applyPreset);
  const toast = useStore((s) => s.toast);
  const [showOptions, setShowOptions] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [showAllTips, setShowAllTips] = useState(false);

  const suggestions = useMemo(() => getSuggestions(data).filter((s) => !dismissed.has(s.id)), [data, dismissed]);
  const warns = suggestions.filter((s) => s.kind === "warn");
  const tips = suggestions.filter((s) => s.kind === "tip");
  const visibleTips = showAllTips ? tips : tips.slice(0, 3);

  const stats = {
    cvars: Object.keys(data.cvars).length,
    binds: Object.values(data.binds).filter(Boolean).length,
    aliases: data.aliases.length,
    custom: data.custom.length,
  };

  const onCopy = async () => {
    if (await copyText(text)) toast("Skopiowano cfg do schowka");
    else toast("Nie udało się skopiować", "err");
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
    if (await copyText(url)) toast("Link do configu skopiowany");
    else toast("Nie udało się skopiować linku", "err");
  };
  const onReset = () => {
    if (window.confirm("Wyczyścić cały config (ustawienia, bindy, aliasy)? Zapisane pliki w Edytorze zostaną.")) {
      resetAll();
      toast("Config wyczyszczony", "info");
    }
  };

  return (
    <div className="space-y-3">
      {(warns.length > 0 || tips.length > 0) && (
        <Card className="p-3">
          <SectionTitle
            right={
              <span className="text-[11px] text-muted">
                {warns.length > 0 && <span className="text-warn">{warns.length} ostrz.</span>}
                {warns.length > 0 && tips.length > 0 && " · "}
                {tips.length > 0 && <span>{tips.length} sugestii</span>}
              </span>
            }
          >
            <span className="inline-flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-accent" /> Sugestie
            </span>
          </SectionTitle>
          <div className="space-y-2">
            {[...warns, ...visibleTips].map((s) => (
              <div
                key={s.id}
                className={cn(
                  "rounded-md border p-2.5 text-xs",
                  s.kind === "warn" ? "border-warn/30 bg-warn/5" : "border-border bg-panel2",
                )}
              >
                <div className="flex items-start gap-2">
                  {s.kind === "warn" ? (
                    <TriangleAlert className="h-4 w-4 text-warn shrink-0 mt-0.5" />
                  ) : (
                    <Lightbulb className="h-4 w-4 text-accent2 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-text">{s.title}</div>
                    <div className="text-muted mt-0.5 leading-snug">{s.desc}</div>
                    <div className="flex gap-2 mt-2">
                      {s.apply && (
                        <Button
                          size="xs"
                          variant="primary"
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
            {tips.length > 3 && (
              <button
                onClick={() => setShowAllTips(!showAllTips)}
                className="text-[11px] text-muted hover:text-text inline-flex items-center gap-1"
              >
                {showAllTips ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showAllTips ? "Mniej" : `Pokaż wszystkie (${tips.length})`}
              </button>
            )}
          </div>
        </Card>
      )}

      <Card className="p-3">
        <SectionTitle
          right={
            <span className="text-[11px] text-muted font-mono">
              {stats.cvars} cvar · {stats.binds} bind · {stats.aliases} alias · {stats.custom} własne
            </span>
          }
        >
          Podgląd autoexec.cfg
        </SectionTitle>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Button variant="primary" onClick={onDownload}>
            <Download className="h-3.5 w-3.5" /> Pobierz
          </Button>
          <Button onClick={onCopy}>
            <Copy className="h-3.5 w-3.5" /> Kopiuj
          </Button>
          <Button onClick={onSave} title="Zapisz jako plik w Edytorze (localStorage)">
            <Save className="h-3.5 w-3.5" /> Zapisz w edytorze
          </Button>
          <Button onClick={onShare} title="Skopiuj link z całym configiem zakodowanym w adresie">
            <Share2 className="h-3.5 w-3.5" /> Link
          </Button>
          <Button variant="danger" onClick={onReset} title="Wyczyść config">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-[11px] text-muted hover:text-text inline-flex items-center gap-1 mb-2"
        >
          {showOptions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />} Opcje generowania
        </button>
        {showOptions && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3 rounded-md border border-border bg-panel2 p-2.5">
            <Toggle checked={options.header} onChange={(v) => setOption("header", v)} label="Nagłówek" />
            <Toggle checked={options.comments} onChange={(v) => setOption("comments", v)} label="Komentarze" />
            <Toggle checked={options.hostWriteconfig} onChange={(v) => setOption("hostWriteconfig", v)} label="host_writeconfig" />
            <Toggle checked={options.echo} onChange={(v) => setOption("echo", v)} label="echo na końcu" />
            <Toggle
              checked={options.unbindall}
              onChange={(v) => setOption("unbindall", v)}
              label="unbindall na start"
              className="col-span-2"
            />
            {options.unbindall && (
              <div className="col-span-2 text-[11px] text-warn">
                Uwaga: unbindall usuwa WSZYSTKIE bindy z gry – musisz mieć w cfg także ruch, strzał, itd.
              </div>
            )}
          </div>
        )}
        <pre className="rounded-md border border-border bg-bg p-3 text-[11px] leading-[1.15rem] font-mono text-[#d8dee9] overflow-auto max-h-[60vh] whitespace-pre">
          {text}
        </pre>
      </Card>
    </div>
  );
}
