"use client";
import { useMemo, useState } from "react";
import { Plus, Check, TriangleAlert, Sparkles, Search } from "lucide-react";
import { PRESETS, PRESET_CATEGORIES } from "@/data/presets";
import { useStore } from "@/lib/store";
import type { Preset } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge, Button, Card, Chip, Input, PageHeader } from "../ui/ui";
import { KeyPicker } from "../binds/KeyPicker";

export function PresetsTab() {
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return PRESETS.filter((p) => {
      if (ql) return p.title.toLowerCase().includes(ql) || p.desc.toLowerCase().includes(ql) || (p.tags ?? []).some((t) => t.includes(ql));
      return cat === "all" || p.category === cat;
    });
  }, [cat, q]);

  return (
    <div className="space-y-3">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            Polecane <Sparkles className="h-4 w-4 text-accent" />
          </span>
        }
        desc="Gotowe zestawy ustawień i bindów, które społeczność najczęściej wrzuca do autoexec. Klawisz możesz zmienić przed dodaniem."
      />
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative md:w-72">
          <Search className="h-4 w-4 text-muted absolute left-2.5 top-2" />
          <Input className="pl-8 w-full" placeholder="Szukaj presetu…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>
            Wszystkie
          </Chip>
          {PRESET_CATEGORIES.map((c) => (
            <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              {c.label}
            </Chip>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {list.map((p) => (
          <PresetCard key={p.id} preset={p} />
        ))}
      </div>
    </div>
  );
}

function PresetCard({ preset: p }: { preset: Preset }) {
  const applyPreset = useStore((s) => s.applyPreset);
  const binds = useStore((s) => s.binds);
  const cvars = useStore((s) => s.cvars);
  const toast = useStore((s) => s.toast);
  const [keys, setKeys] = useState<Record<number, string>>({});

  const isApplied = useMemo(() => {
    const cvOk = Object.entries(p.cvars ?? {}).every(([k, v]) => cvars[k] === v);
    const bOk = (p.binds ?? []).every((b, i) => {
      const key = keys[i] ?? b.key;
      return key ? binds[key] === b.command : true;
    });
    return (p.cvars || p.binds) && cvOk && bOk;
  }, [p, cvars, binds, keys]);

  const apply = () => {
    applyPreset({
      cvars: p.cvars,
      binds: (p.binds ?? [])
        .map((b, i) => ({ key: keys[i] ?? b.key ?? "", command: b.command }))
        .filter((b) => b.key),
      aliases: p.aliases,
      custom: p.custom,
    });
    toast(`Dodano: ${p.title}`);
  };

  const conflicts = (p.binds ?? []).filter((b, i) => {
    const key = keys[i] ?? b.key;
    return key && binds[key] && binds[key] !== b.command;
  });

  return (
    <Card className={cn("p-3.5 flex flex-col transition-colors duration-150 ease", isApplied && "border-ok/40 bg-ok/[0.03]")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[13px] font-semibold tracking-tight flex items-center gap-2 flex-wrap">
            {p.title}
            {(p.tags ?? []).map((t) => (
              <Badge key={t} tone={t === "polecane" ? "amber" : t === "mm-safe" ? "green" : t.includes("MM") || t.includes("cheat") ? "red" : "gray"}>
                {t}
              </Badge>
            ))}
          </div>
          {p.desc && <div className="text-xs text-muted mt-1 leading-snug">{p.desc}</div>}
        </div>
      </div>

      <div className="mt-2 space-y-1 text-[11px] font-mono flex-1">
        {p.cvars &&
          Object.entries(p.cvars).map(([k, v]) => (
            <div key={k} className="flex gap-2 text-muted">
              <span className="text-accent2">{k}</span>
              <span className="text-text">{v}</span>
              {cvars[k] !== undefined && cvars[k] !== v && <span className="text-warn">(masz: {cvars[k]})</span>}
            </div>
          ))}
        {p.aliases?.map((a) => (
          <div key={a.name} className="text-muted">
            alias <span className="text-purple">{a.name}</span> <span className="text-text">&quot;{a.command}&quot;</span>
          </div>
        ))}
        {p.binds?.map((b, i) => {
          const key = keys[i] ?? b.key ?? "";
          const taken = key && binds[key] && binds[key] !== b.command;
          return (
            <div key={i} className="flex items-center gap-2">
              <KeyPicker
                value={key || null}
                onChange={(k) => setKeys({ ...keys, [i]: k })}
                binds={binds}
                command={b.command}
                title={`Klawisz dla: ${b.label}`}
                className="w-[110px] justify-center"
              />
              <span className="text-text truncate" title={b.command}>
                {b.command}
              </span>
              <span className="text-muted font-sans truncate">– {b.label}</span>
              {taken && <span className="text-warn font-sans shrink-0">nadpisze: {binds[key]}</span>}
            </div>
          );
        })}
        {p.custom && (
          <details className="text-muted">
            <summary className="cursor-pointer hover:text-text">{p.custom.length} linii komend</summary>
            <pre className="mt-1 whitespace-pre-wrap text-[10px] text-text/80">{p.custom.join("\n")}</pre>
          </details>
        )}
        {p.note && <div className="text-warn font-sans mt-1">{p.note}</div>}
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border">
        <div className="text-[11px] text-muted flex items-center gap-1">
          {p.practice && (
            <>
              <TriangleAlert className="h-3.5 w-3.5 text-warn" /> tylko serwer lokalny / community
            </>
          )}
          {!p.practice && conflicts.length > 0 && (
            <>
              <TriangleAlert className="h-3.5 w-3.5 text-warn" /> {conflicts.length} klawisz(e) zajęte – zostaną nadpisane
            </>
          )}
        </div>
        <Button variant={isApplied ? "default" : "primary"} size="xs" onClick={apply}>
          <span key={isApplied ? "a" : "b"} className="swap">
            {isApplied ? <Check className="h-3 w-3 text-ok" /> : <Plus className="h-3 w-3" />}
            {isApplied ? "Dodane" : "Dodaj do cfg"}
          </span>
        </Button>
      </div>
    </Card>
  );
}
