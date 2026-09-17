"use client";
import { useMemo, useState } from "react";
import { Search, Plus, KeyboardIcon, Copy, Info, ChevronDown } from "lucide-react";
import { useCommands, searchCommands, FLAG_LABEL } from "@/lib/commands";
import { COMMAND_CATEGORIES } from "@/lib/categorize";
import { useStore } from "@/lib/store";
import type { CommandEntry, Visibility } from "@/lib/types";
import { copyText, cn } from "@/lib/utils";
import meta from "@/data/commands.meta.json";
import { Badge, Button, Card, Input, Select, Toggle } from "../ui/ui";
import { KeyPickerModal } from "../binds/KeyPickerModal";

const PAGE = 150;

export function CommandsTab() {
  const { commands, error } = useCommands();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [kind, setKind] = useState<"all" | "cmd" | "cvar">("all");
  const [cheat, setCheat] = useState<"all" | "no" | "only">("all");
  const showHidden = useStore((s) => s.ui.showHidden);
  const showDev = useStore((s) => s.ui.showDev);
  const setShowHidden = useStore((s) => s.setShowHidden);
  const setShowDev = useStore((s) => s.setShowDev);
  const [limit, setLimit] = useState(PAGE);

  const visibility = useMemo(() => {
    const v = new Set<Visibility>(["release"]);
    if (showHidden) v.add("hidden");
    if (showDev) v.add("dev");
    return v;
  }, [showHidden, showDev]);

  const { results, total } = useMemo(() => {
    if (!commands) return { results: [], total: 0 };
    return searchCommands(commands, { q, category: cat || null, visibility, kind, cheat, limit });
  }, [commands, q, cat, visibility, kind, cheat, limit]);

  const stats = meta.stats as Record<string, number>;

  return (
    <div className="space-y-3">
      <Card className="p-3">
        <div className="flex items-start gap-2 text-xs text-muted leading-relaxed">
          <Info className="h-4 w-4 text-accent2 shrink-0 mt-0.5" />
          <div>
            <span className="text-text font-semibold">{meta.count} komend i cvarów CS2</span> – w tym{" "}
            <span className="text-accent2">{stats.hidden} ukrytych</span> (bez flagi release, nie podpowiadają się w konsoli) i{" "}
            <span className="text-purple">{stats.dev} dev-only</span> (działają tylko w buildach deweloperskich). Opisy pochodzą z gry (po angielsku).
            Kliknij nazwę, aby zobaczyć flagi.
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-2">
        <div className="relative">
          <Search className="h-4 w-4 text-muted absolute left-2.5 top-2" />
          <Input
            className="pl-8 w-full"
            placeholder="Szukaj: np. radar, cl_hud, fps, snd_, viewmodel…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setLimit(PAGE);
            }}
            autoFocus
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={cat} onChange={(e) => { setCat(e.target.value); setLimit(PAGE); }}>
            <option value="">Wszystkie kategorie</option>
            {COMMAND_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
            <option value="all">cvary + komendy</option>
            <option value="cvar">tylko cvary</option>
            <option value="cmd">tylko komendy</option>
          </Select>
          <Select value={cheat} onChange={(e) => setCheat(e.target.value as typeof cheat)}>
            <option value="all">cheat: wszystkie</option>
            <option value="no">bez sv_cheats</option>
            <option value="only">tylko sv_cheats</option>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Toggle checked={showHidden} onChange={setShowHidden} label="Pokaż ukryte" />
        <Toggle checked={showDev} onChange={setShowDev} label="Pokaż dev-only" />
        <span className="text-[11px] text-muted ml-auto">
          {commands ? `${total} wyników` : error ? `Błąd: ${error}` : "Ładowanie bazy…"}
        </span>
      </div>

      <div className="space-y-1.5">
        {results.map((e) => (
          <CommandRow key={e.n} e={e} />
        ))}
        {total > results.length && (
          <Button className="w-full" onClick={() => setLimit(limit + PAGE)}>
            <ChevronDown className="h-4 w-4" /> Pokaż więcej ({total - results.length} pozostało)
          </Button>
        )}
      </div>
    </div>
  );
}

function CommandRow({ e }: { e: CommandEntry }) {
  const cvars = useStore((s) => s.cvars);
  const setCvar = useStore((s) => s.setCvar);
  const addCustom = useStore((s) => s.addCustom);
  const binds = useStore((s) => s.binds);
  const setBind = useStore((s) => s.setBind);
  const toast = useStore((s) => s.toast);
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState(false);
  const [val, setVal] = useState(cvars[e.n] ?? e.d ?? "");
  const inCfg = cvars[e.n] !== undefined;
  const isCheat = e.f.includes("cheat");

  const bindIt = () => setPick(true);

  return (
    <Card className={cn("px-3 py-2", inCfg && "border-accent/40")}>
      <div className="flex flex-wrap items-center gap-2">
        <button className="font-mono text-xs text-accent2 hover:underline" onClick={() => setOpen(!open)}>
          {e.n}
        </button>
        <Badge tone={e.k === "cvar" ? "gray" : "purple"}>{e.k === "cvar" ? "cvar" : "cmd"}</Badge>
        {e.v === "hidden" && <Badge tone="cyan" title="Brak flagi release">ukryta</Badge>}
        {e.v === "dev" && <Badge tone="purple" title="FCVAR_DEVELOPMENTONLY">dev-only</Badge>}
        {isCheat && <Badge tone="red" title="Wymaga sv_cheats 1">cheat</Badge>}
        {e.f.includes("archive") && <Badge tone="gray" title="Zapisywana w configu gry">archive</Badge>}
        {inCfg && <Badge tone="amber">w cfg</Badge>}
        {e.d !== null && (
          <span className="text-[11px] text-muted font-mono">
            domyślnie: <span className="text-text">{e.d === "" ? '""' : e.d}</span>
          </span>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          {e.k === "cvar" && (
            <>
              <Input className="h-7 w-[110px] font-mono text-[11px]" value={val} onChange={(ev) => setVal(ev.target.value)} placeholder="wartość" />
              <Button
                size="xs"
                variant={inCfg ? "default" : "primary"}
                onClick={() => {
                  setCvar(e.n, val);
                  toast(`${e.n} ${val} dodano do cfg`);
                }}
              >
                <Plus className="h-3 w-3" /> {inCfg ? "Zmień" : "Dodaj"}
              </Button>
            </>
          )}
          {e.k === "cmd" && (
            <Button
              size="xs"
              onClick={() => {
                addCustom(e.n);
                toast(`Dodano linię: ${e.n}`);
              }}
              title="Dodaj jako własną linię w cfg"
            >
              <Plus className="h-3 w-3" /> Linia
            </Button>
          )}
          <Button size="xs" onClick={bindIt} title="Przypisz do klawisza">
            <KeyboardIcon className="h-3 w-3" /> Binduj
          </Button>
          <button
            className="text-muted hover:text-text p-1"
            title="Kopiuj nazwę"
            onClick={async () => {
              await copyText(e.n);
              toast("Skopiowano");
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <KeyPickerModal
        open={pick}
        binds={binds}
        command={e.n}
        title={`Wybierz klawisz dla: ${e.n}`}
        onSelect={(k) => {
          setBind(k, e.n);
          setPick(false);
          toast(`Zbindowano ${e.n} → ${k}`);
        }}
        onClose={() => setPick(false)}
      />
      {e.h && <div className={cn("text-[11px] text-muted mt-1", !open && "line-clamp-2")}>{e.h}</div>}
      {open && (
        <div className="mt-2 flex flex-wrap gap-1">
          {e.f.map((f) => (
            <Badge key={f} tone="gray" title={FLAG_LABEL[f] ?? f}>
              {f}
            </Badge>
          ))}
          {e.f.length === 0 && <span className="text-[11px] text-muted">brak flag</span>}
        </div>
      )}
    </Card>
  );
}
