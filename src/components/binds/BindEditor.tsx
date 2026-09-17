"use client";
import { useMemo, useState } from "react";
import { Check, Trash2, Plus, Search, Copy } from "lucide-react";
import { useStore } from "@/lib/store";
import { ACTIONS, ACTION_GROUPS } from "@/data/actions";
import { WEAPONS, WEAPON_GROUPS, buyCost } from "@/data/weapons";
import { keyLabel } from "@/data/keys";
import { useCommands, searchCommands } from "@/lib/commands";
import { bindLine } from "@/lib/generate";
import { cn, copyText } from "@/lib/utils";
import { Badge, Button, Card, Chip, Input, SectionTitle, Kbd, Toggle } from "../ui/ui";
import { KeyPicker } from "./KeyPicker";

type Mode = "actions" | "buy" | "commands" | "custom";

export function BindEditor() {
  const selectedKey = useStore((s) => s.ui.selectedKey);
  const binds = useStore((s) => s.binds);
  const setBind = useStore((s) => s.setBind);
  const removeBind = useStore((s) => s.removeBind);
  const renameBindKey = useStore((s) => s.renameBindKey);
  const selectKey = useStore((s) => s.selectKey);
  const toast = useStore((s) => s.toast);

  const [mode, setMode] = useState<Mode>("actions");
  const [draft, setDraft] = useState("");
  const [append, setAppend] = useState(false);
  const [group, setGroup] = useState(ACTION_GROUPS[0].id);
  const [buySel, setBuySel] = useState<string[]>([]);
  const [cq, setCq] = useState("");
  const { commands } = useCommands();

  const current = selectedKey ? (binds[selectedKey] ?? "") : "";
  // reset pola przy zmianie klawisza / zewnętrznej zmianie binda (wzorzec "derive state during render")
  const sig = `${selectedKey ?? ""}\u0000${current}`;
  const [prevSig, setPrevSig] = useState(sig);
  if (prevSig !== sig) {
    setPrevSig(sig);
    setDraft(current);
    setBuySel(
      current
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.startsWith("buy "))
        .map((s) => s.slice(4).trim()),
    );
  }

  const put = (cmd: string) => {
    if (append && draft.trim()) setDraft(`${draft.trim()}; ${cmd}`);
    else setDraft(cmd);
  };

  const save = () => {
    if (!selectedKey) return;
    const v = draft.trim();
    if (!v) {
      removeBind(selectedKey);
      toast(`Usunięto bind z ${selectedKey}`, "info");
      return;
    }
    setBind(selectedKey, v);
    toast(`Zapisano: ${selectedKey} → ${v}`);
  };

  const cmdResults = useMemo(() => {
    if (!commands) return [];
    return searchCommands(commands, { q: cq, visibility: new Set(["release", "hidden"]), limit: 40 }).results;
  }, [commands, cq]);

  const buyCmd = buySel.map((b) => `buy ${b}`).join("; ");
  const costT = buyCost(buySel, "t");
  const costCT = buyCost(buySel, "ct");

  if (!selectedKey) {
    return (
      <Card className="p-3">
        <SectionTitle>Edytor binda</SectionTitle>
        <div className="text-xs text-muted py-8 text-center">
          Wybierz klawisz na klawiaturze (kliknij lub użyj „Wykryj naciśnięty klawisz”), aby przypisać mu komendę.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <SectionTitle
        right={
          <div className="flex items-center gap-1.5">
            <KeyPicker
              value={selectedKey}
              binds={binds}
              command={current || undefined}
              title="Zmień klawisz"
              onChange={(k) => {
                if (k === selectedKey) return;
                if (current) {
                  renameBindKey(selectedKey, k);
                  toast(`Przeniesiono bind ${selectedKey} → ${k}`);
                }
                selectKey(k);
              }}
            />
            <Button size="xs" variant="ghost" onClick={() => selectKey(null)}>
              Zamknij
            </Button>
          </div>
        }
      >
        <span className="inline-flex items-center gap-2">
          Klawisz <Kbd>{selectedKey}</Kbd> <span className="text-muted font-normal text-xs">{keyLabel(selectedKey)}</span>
        </span>
      </SectionTitle>

      <div className="flex gap-1.5 mb-2">
        <Input
          className="font-mono w-full"
          placeholder="Komenda, np. slot8 lub buy ak47; buy m4a1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
        />
        <Button variant="primary" onClick={save} title="Zapisz bind">
          <Check className="h-3.5 w-3.5" /> Zapisz
        </Button>
        {current && (
          <Button variant="danger" onClick={() => { removeBind(selectedKey); toast("Usunięto bind", "info"); }} title="Usuń bind">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between mb-2">
        <Toggle checked={append} onChange={setAppend} label="Dopisuj do istniejącej (średnik)" />
        {draft.trim() && (
          <button
            className="text-[11px] text-muted hover:text-text inline-flex items-center gap-1"
            onClick={async () => {
              await copyText(bindLine(selectedKey, draft.trim()));
              toast("Skopiowano linię bind");
            }}
          >
            <Copy className="h-3 w-3" /> kopiuj linię
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-border mb-2">
        {(
          [
            ["actions", "Akcje"],
            ["buy", "Kupowanie"],
            ["commands", "Komendy / cvary"],
            ["custom", "Pomoc"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "px-3 h-8 text-xs border-b-2 -mb-px transition-colors",
              mode === m ? "border-accent text-accent-hi" : "border-transparent text-muted hover:text-text",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "actions" && (
        <div>
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {ACTION_GROUPS.map((g) => (
              <Chip key={g.id} active={group === g.id} onClick={() => setGroup(g.id)}>
                {g.label}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[300px] overflow-y-auto pr-1">
            {ACTIONS.filter((a) => a.group === group).map((a) => (
              <button
                key={a.command}
                onClick={() => put(a.command)}
                className={cn(
                  "text-left rounded-md border border-border bg-panel2 px-2 py-1.5 hover:border-accent/50 hover:bg-panel3 transition-colors",
                  draft.trim() === a.command && "border-accent/60 bg-accent/10",
                )}
                title={a.desc}
              >
                <div className="text-xs">{a.label}</div>
                <div className="font-mono text-[10px] text-accent2 truncate">{a.command}</div>
              </button>
            ))}
          </div>
          {group === "practice" && (
            <div className="text-[11px] text-warn mt-2">Te komendy działają tylko z sv_cheats 1 (serwer lokalny / community).</div>
          )}
        </div>
      )}

      {mode === "buy" && (
        <div>
          <div className="text-[11px] text-muted mb-2">
            Zaznacz kilka pozycji – zbuduje się jeden bind. Broń T i CT w jednym bindzie jest OK: gra kupi tę, którą masz w loadoucie po swojej stronie.
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {WEAPON_GROUPS.map((g) => (
              <div key={g.id}>
                <div className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-1">{g.label}</div>
                <div className="flex flex-wrap gap-1">
                  {WEAPONS.filter((w) => w.group === g.id).map((w) => {
                    const on = buySel.includes(w.buy);
                    return (
                      <button
                        key={w.buy}
                        onClick={() => setBuySel(on ? buySel.filter((b) => b !== w.buy) : [...buySel, w.buy])}
                        className={cn(
                          "rounded-md border px-2 py-1 text-[11px] transition-colors",
                          on ? "border-accent bg-accent/15 text-accent-hi" : "border-border bg-panel2 text-text hover:border-[#3d4a61]",
                        )}
                        title={`buy ${w.buy} · $${w.price}`}
                      >
                        {w.label}
                        <span className={cn("ml-1 text-[9px] uppercase", w.team === "t" ? "text-warn" : w.team === "ct" ? "text-accent2" : "text-muted")}>
                          {w.team === "both" ? "" : w.team}
                        </span>
                        <span className="ml-1 text-[10px] text-muted">${w.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-md border border-border bg-panel2 p-2 text-xs">
            <div className="font-mono text-accent2 break-all min-h-[1rem]">{buyCmd || "—"}</div>
            <div className="flex items-center justify-between mt-1.5">
              <div className="text-[11px] text-muted">
                Koszt: <span className="text-warn">T ${costT}</span> · <span className="text-accent2">CT ${costCT}</span>
              </div>
              <div className="flex gap-1.5">
                <Button size="xs" variant="ghost" onClick={() => setBuySel([])}>
                  Wyczyść
                </Button>
                <Button size="xs" onClick={() => put(buyCmd)} disabled={!buyCmd}>
                  <Plus className="h-3 w-3" /> Wstaw do pola
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "commands" && (
        <div>
          <div className="relative mb-2">
            <Search className="h-4 w-4 text-muted absolute left-2.5 top-2" />
            <Input className="pl-8 w-full" placeholder="Szukaj komendy lub cvara…" value={cq} onChange={(e) => setCq(e.target.value)} autoFocus />
          </div>
          {!commands && <div className="text-xs text-muted">Ładowanie bazy komend…</div>}
          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
            {cmdResults.map((e) => (
              <div key={e.n} className="rounded-md border border-border bg-panel2 px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs text-accent2">{e.n}</code>
                  {e.v === "hidden" && <Badge tone="cyan">ukryta</Badge>}
                  {e.f.includes("cheat") && <Badge tone="red">cheat</Badge>}
                  {e.d !== null && <span className="text-[10px] text-muted font-mono">= {e.d}</span>}
                  <div className="flex-1" />
                  {e.k === "cvar" ? (
                    <>
                      <Button size="xs" onClick={() => put(`${e.n} ${e.d ?? ""}`.trim())} title="Wstaw ustawienie wartości">
                        ustaw
                      </Button>
                      <Button size="xs" onClick={() => put(`toggle ${e.n} 0 1`)} title="Przełącznik 0/1">
                        toggle
                      </Button>
                      <Button size="xs" onClick={() => put(`incrementvar ${e.n} 0 1 0.1`)} title="Zwiększanie wartości">
                        incr
                      </Button>
                    </>
                  ) : (
                    <Button size="xs" onClick={() => put(e.n)}>
                      wstaw
                    </Button>
                  )}
                </div>
                {e.h && <div className="text-[11px] text-muted mt-0.5 line-clamp-2">{e.h}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "custom" && (
        <div className="text-xs text-muted space-y-2 leading-relaxed">
          <p>
            Wpisz dowolną komendę w polu powyżej. Kilka komend oddziel średnikiem: <code className="text-accent2">slot8; cl_crosshairsize 1000</code>.
          </p>
          <p>
            Przełącznik: <code className="text-accent2">toggle nazwa_cvara 0 1</code> · Zwiększanie: <code className="text-accent2">incrementvar cvar min max krok</code>.
          </p>
          <p>
            Przytrzymanie/puszczenie: komendy z <code className="text-accent2">+</code> działają przy trzymaniu klawisza (np. <code className="text-accent2">+voicerecord</code>).
          </p>
          <p>
            Aliasy (np. <code className="text-accent2">+netg</code>) definiuj w presetach albo w Edytorze; tutaj wystarczy wpisać ich nazwę.
          </p>
          <p className="text-warn">
            Od 19.08.2024 oficjalne serwery Valve blokują bindy łączące kilka akcji ruchu/ataku (np. jumpthrow). Takie bindy używaj tylko do treningu.
          </p>
        </div>
      )}
    </Card>
  );
}
