"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { FilePlus2, Upload, Download, Copy, Trash2, Pencil, Import, RefreshCw, FileCode2, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { parseCfg } from "@/lib/parse";
import { copyText, downloadText, formatDate, cn } from "@/lib/utils";
import { Button, Card, SectionTitle, Badge } from "../ui/ui";
import { CodeEditor } from "./CodeEditor";
import { useCfgText } from "../PreviewPanel";

export function EditorTab() {
  const files = useStore((s) => s.files);
  const activeFileId = useStore((s) => s.activeFileId);
  const createFile = useStore((s) => s.createFile);
  const updateFile = useStore((s) => s.updateFile);
  const deleteFile = useStore((s) => s.deleteFile);
  const setActiveFile = useStore((s) => s.setActiveFile);
  const replaceData = useStore((s) => s.replaceData);
  const mergeData = useStore((s) => s.mergeData);
  const toast = useStore((s) => s.toast);
  const { text: generated } = useCfgText();

  const active = useMemo(() => files.find((f) => f.id === activeFileId) ?? files[0] ?? null, [files, activeFileId]);
  const [draft, setDraft] = useState(active?.content ?? "");
  const [saved, setSaved] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const activeIdRef = useRef<string | null>(active?.id ?? null);

  // zmiana aktywnego pliku → załaduj treść
  useEffect(() => {
    if (active?.id !== activeIdRef.current) {
      activeIdRef.current = active?.id ?? null;
      setDraft(active?.content ?? "");
      setSaved(true);
    }
  }, [active]);

  // autozapis z opóźnieniem
  useEffect(() => {
    if (!active || saved) return;
    const t = setTimeout(() => {
      updateFile(active.id, { content: draft });
      setSaved(true);
    }, 500);
    return () => clearTimeout(t);
  }, [draft, saved, active, updateFile]);

  const onChange = (v: string) => {
    setDraft(v);
    setSaved(false);
  };

  const newFile = (content = "", name?: string) => {
    const n = name ?? window.prompt("Nazwa pliku:", files.length ? `plik${files.length + 1}.cfg` : "autoexec.cfg");
    if (!n) return;
    createFile(n.endsWith(".cfg") ? n : `${n}.cfg`, content);
    toast(`Utworzono ${n}`);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then((t) => {
      createFile(f.name, t);
      toast(`Wczytano ${f.name}`);
    });
    e.target.value = "";
  };

  const importToGenerator = (mode: "replace" | "merge") => {
    const r = parseCfg(draft);
    if (r.count === 0) {
      toast("Nie rozpoznano żadnych komend", "err");
      return;
    }
    if (mode === "replace") {
      if (!window.confirm(`Zastąpić bieżący config ${r.count} instrukcjami z pliku?`)) return;
      replaceData(r.data, r.options);
    } else {
      mergeData(r.data, r.options);
    }
    const parts = [
      `${Object.keys(r.data.cvars).length} cvarów`,
      `${Object.keys(r.data.binds).length} bindów`,
      `${r.data.aliases.length} aliasów`,
      `${r.data.custom.length} własnych`,
    ];
    toast(`Zaimportowano: ${parts.join(", ")}`);
    if (r.warnings.length) console.warn(r.warnings);
  };

  const rename = () => {
    if (!active) return;
    const n = window.prompt("Nowa nazwa:", active.name);
    if (n && n !== active.name) updateFile(active.id, { name: n });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-3">
      <Card className="p-3">
        <SectionTitle>Pliki</SectionTitle>
        <div className="flex flex-col gap-1.5 mb-3">
          <Button onClick={() => newFile()} className="justify-start">
            <FilePlus2 className="h-3.5 w-3.5" /> Nowy pusty plik
          </Button>
          <Button onClick={() => newFile(generated, "autoexec.cfg")} className="justify-start" title="Nowy plik z aktualnie wygenerowanym cfg">
            <FileCode2 className="h-3.5 w-3.5" /> Nowy z generatora
          </Button>
          <Button onClick={() => fileInput.current?.click()} className="justify-start">
            <Upload className="h-3.5 w-3.5" /> Wczytaj z dysku (.cfg/.vcfg)
          </Button>
          <input ref={fileInput} type="file" accept=".cfg,.txt,.vcfg" className="hidden" onChange={onUpload} />
        </div>
        <div className="space-y-1">
          {files.length === 0 && <div className="text-xs text-muted py-4 text-center">Brak zapisanych plików.</div>}
          {files.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFile(f.id)}
              className={cn(
                "w-full text-left rounded-md border px-2 py-1.5 transition-colors",
                active?.id === f.id ? "border-accent/60 bg-accent/10" : "border-border bg-panel2 hover:border-[#3d4a61]",
              )}
            >
              <div className="text-xs font-medium truncate">{f.name}</div>
              <div className="text-[10px] text-muted">
                {formatDate(f.updatedAt)} · {f.content.split("\n").length} linii
              </div>
            </button>
          ))}
        </div>
        <div className="text-[11px] text-muted mt-3 leading-snug">
          Pliki są zapisywane automatycznie w przeglądarce (localStorage). Wczytać możesz też pliki .vcfg ze Steam (cs2_user_keys… /
          cs2_user_convars…).
        </div>
      </Card>

      <Card className="p-3 flex flex-col min-h-[70vh]">
        {!active ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted">Utwórz lub wczytaj plik, aby edytować.</div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <button className="text-sm font-semibold inline-flex items-center gap-1.5 hover:text-accent-hi" onClick={rename} title="Zmień nazwę">
                {active.name} <Pencil className="h-3 w-3 text-muted" />
              </button>
              <Badge tone={saved ? "green" : "amber"}>{saved ? "zapisano" : "zapisywanie…"}</Badge>
              <div className="flex-1" />
              <Button size="xs" onClick={() => { onChange(generated); toast("Wstawiono wygenerowany cfg"); }} title="Zastąp treść aktualnym wygenerowanym cfg">
                <RefreshCw className="h-3 w-3" /> Wstaw z generatora
              </Button>
              <Button size="xs" onClick={() => importToGenerator("merge")} title="Dopisz ustawienia i bindy z tego pliku do generatora">
                <Import className="h-3 w-3" /> Do generatora (dopisz)
              </Button>
              <Button size="xs" onClick={() => importToGenerator("replace")} title="Zastąp config w generatorze zawartością tego pliku">
                <Import className="h-3 w-3" /> Do generatora (zastąp)
              </Button>
              <Button size="xs" onClick={async () => { await copyText(draft); toast("Skopiowano"); }}>
                <Copy className="h-3 w-3" /> Kopiuj
              </Button>
              <Button size="xs" variant="primary" onClick={() => downloadText(active.name, draft)}>
                <Download className="h-3 w-3" /> Pobierz
              </Button>
              <Button
                size="xs"
                variant="danger"
                onClick={() => {
                  if (window.confirm(`Usunąć plik ${active.name}?`)) {
                    deleteFile(active.id);
                    toast("Usunięto plik", "info");
                  }
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 min-h-[55vh]">
              <CodeEditor value={draft} onChange={onChange} className="h-full min-h-[55vh]" placeholder="// wpisz komendy cfg…" />
            </div>
            <div className="text-[11px] text-muted mt-2 flex items-center gap-1">
              <Check className="h-3 w-3" /> {draft.split("\n").length} linii · {draft.length} znaków · Tab wstawia tabulator
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
