"use client";
import { useEffect, useMemo, useState } from "react";
import { Crosshair, Trash2, Copy, Pencil, KeyboardIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { CODE_TO_KEY, keyFromMouseButton, keyLabel, KEY_BY_ID } from "@/data/keys";
import { bindLine } from "@/lib/generate";
import { copyText } from "@/lib/utils";
import { Button, Card, SectionTitle, Kbd } from "../ui/ui";
import { KeyPicker } from "./KeyPicker";
import { Keyboard } from "./Keyboard";
import { BindEditor } from "./BindEditor";

export function BindsTab() {
  const binds = useStore((s) => s.binds);
  const selectedKey = useStore((s) => s.ui.selectedKey);
  const selectKey = useStore((s) => s.selectKey);
  const capture = useStore((s) => s.ui.capture);
  const setCapture = useStore((s) => s.setCapture);
  const removeBind = useStore((s) => s.removeBind);
  const renameBindKey = useStore((s) => s.renameBindKey);
  const toast = useStore((s) => s.toast);
  const [lastCaptured, setLastCaptured] = useState<string | null>(null);

  // Wykrywanie fizycznie naciśniętego klawisza / przycisku myszy / kółka
  useEffect(() => {
    if (!capture) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === "Escape") {
        setCapture(false);
        return;
      }
      const id = CODE_TO_KEY[e.code];
      if (id && !KEY_BY_ID[id]?.disabled) {
        selectKey(id);
        setLastCaptured(id);
      } else {
        toast(`Nieznany klawisz: ${e.code}`, "err");
      }
    };
    const onMouse = (e: MouseEvent) => {
      const id = keyFromMouseButton(e.button);
      if (!id) return;
      e.preventDefault();
      e.stopPropagation();
      selectKey(id);
      setLastCaptured(id);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const id = e.deltaY < 0 ? "mwheelup" : "mwheeldown";
      selectKey(id);
      setLastCaptured(id);
    };
    const onCtx = (e: Event) => e.preventDefault();
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("mousedown", onMouse, true);
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("contextmenu", onCtx, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("mousedown", onMouse, true);
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("contextmenu", onCtx, true);
    };
  }, [capture, selectKey, setCapture, toast]);

  const bindList = useMemo(
    () =>
      Object.entries(binds)
        .filter(([, c]) => c.trim())
        .sort((a, b) => a[0].localeCompare(b[0])),
    [binds],
  );

  return (
    <div className="space-y-3">
      <Card className="p-3">
        <SectionTitle
          right={
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted">{bindList.length} zbindowanych</span>
              <Button size="xs" variant={capture ? "accent2" : "default"} onClick={() => setCapture(!capture)}>
                <Crosshair className="h-3.5 w-3.5" />
                {capture ? "Nasłuchuję… (Esc anuluje)" : "Wykryj naciśnięty klawisz"}
              </Button>
            </div>
          }
        >
          <span className="inline-flex items-center gap-1.5">
            <KeyboardIcon className="h-4 w-4 text-accent" /> Klawiatura
          </span>
        </SectionTitle>
        {capture && (
          <div className="mb-2 rounded-md border border-accent2/40 bg-accent2/10 px-3 py-2 text-xs text-accent2 fade-in">
            Naciśnij dowolny klawisz, przycisk myszy lub przewiń kółkiem – zostanie zaznaczony na klawiaturze.
            {lastCaptured && (
              <>
                {" "}
                Ostatnio: <Kbd>{lastCaptured}</Kbd>
              </>
            )}
          </div>
        )}
        <Keyboard binds={binds} selected={selectedKey} onSelect={(k) => selectKey(k)} />
        <div className="text-[11px] text-muted mt-1">
          Kliknij klawisz, aby przypisać komendę. Klawisze z bindem są podświetlone na pomarańczowo. Esc jest zarezerwowany przez grę.
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
        <BindEditor />
        <Card className="p-3">
          <SectionTitle right={<span className="text-[11px] text-muted">{bindList.length}</span>}>Twoje bindy</SectionTitle>
          {bindList.length === 0 ? (
            <div className="text-xs text-muted py-6 text-center">Brak bindów. Wybierz klawisz na klawiaturze albo dodaj preset z zakładki „Polecane”.</div>
          ) : (
            <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
              {bindList.map(([key, cmd]) => (
                <div key={key} className="flex items-center gap-2 rounded-md border border-border bg-panel2 px-2 py-1.5 text-xs group">
                  <KeyPicker
                    value={key}
                    onChange={(k) => {
                      if (k !== key) {
                        renameBindKey(key, k);
                        toast(`Przeniesiono bind ${key} → ${k}`);
                      }
                    }}
                    binds={binds}
                    command={cmd}
                    title={`Przenieś bind z ${key}`}
                    className="w-[120px] justify-center h-7"
                  />
                  <code className="flex-1 font-mono text-[11px] text-accent-hi truncate" title={cmd}>
                    {cmd}
                  </code>
                  <button className="text-muted hover:text-text" title="Edytuj" onClick={() => selectKey(key)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="text-muted hover:text-text"
                    title="Kopiuj linię bind"
                    onClick={async () => {
                      await copyText(bindLine(key, cmd));
                      toast("Skopiowano");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button className="text-muted hover:text-danger" title="Usuń" onClick={() => removeBind(key)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="text-[11px] text-muted mt-2">
            Wskazówka: klawisz {keyLabel("mouse4")} i {keyLabel("mouse5")} to boczne przyciski myszy.
          </div>
        </Card>
      </div>
    </div>
  );
}
