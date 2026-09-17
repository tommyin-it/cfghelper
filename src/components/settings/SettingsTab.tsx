"use client";
import { useMemo, useState } from "react";
import { Search, RotateCcw, Star, EyeOff } from "lucide-react";
import { SETTINGS, SETTING_CATEGORIES } from "@/data/settings";
import { useStore } from "@/lib/store";
import type { SettingDef } from "@/lib/types";
import { cn, normalizeBool } from "@/lib/utils";
import { Badge, Button, Card, Chip, Input, PageHeader, Select, Toggle } from "../ui/ui";

export function SettingsTab() {
  const [cat, setCat] = useState<string>("radar");
  const [q, setQ] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const cvars = useStore((s) => s.cvars);
  const setCvar = useStore((s) => s.setCvar);
  const removeCvar = useStore((s) => s.removeCvar);
  const toast = useStore((s) => s.toast);

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return SETTINGS.filter((s) => {
      if (onlyChanged && cvars[s.name] === undefined) return false;
      if (ql) return s.name.toLowerCase().includes(ql) || s.label.toLowerCase().includes(ql) || s.desc.toLowerCase().includes(ql);
      return s.category === cat;
    });
  }, [cat, q, onlyChanged, cvars]);

  const category = SETTING_CATEGORIES.find((c) => c.id === cat);
  const changedInCat = SETTINGS.filter((s) => s.category === cat && cvars[s.name] !== undefined).length;

  const applyRecommended = () => {
    let n = 0;
    for (const s of SETTINGS) {
      if (s.category === cat && s.recommended !== undefined) {
        setCvar(s.name, s.recommended);
        n++;
      }
    }
    toast(`Ustawiono ${n} polecanych wartości`);
  };
  const resetCat = () => {
    for (const s of SETTINGS) if (s.category === cat) removeCvar(s.name);
    toast("Usunięto ustawienia z tej kategorii", "info");
  };

  return (
    <div className="space-y-3">
      <PageHeader title="Ustawienia" desc="Najważniejsze cvary CS2 z opisami i polecanymi wartościami. Ustawione trafiają do autoexec.cfg.">
        <Toggle checked={onlyChanged} onChange={setOnlyChanged} label="Tylko ustawione" />
      </PageHeader>
      <div className="relative">
        <Search className="h-4 w-4 text-muted absolute left-2.5 top-2" />
        <Input className="pl-8 w-full md:max-w-md" placeholder="Szukaj ustawienia (nazwa cvara, opis)…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {!q && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {SETTING_CATEGORIES.map((c) => {
            const n = SETTINGS.filter((s) => s.category === c.id && cvars[s.name] !== undefined).length;
            return (
              <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
                {c.label}
                {n > 0 && <span className={cn("ml-1.5 rounded-full px-1.5 text-[10px] tnum", cat === c.id ? "bg-white/20 text-white" : "bg-accent/15 text-accent-hi")}>{n}</span>}
              </Chip>
            );
          })}
        </div>
      )}

      {!q && category && (
        <Card className="p-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
          <div>
            <div className="text-sm font-semibold">{category.label}</div>
            <div className="text-xs text-muted">{category.desc}</div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button variant="primary" size="xs" onClick={applyRecommended}>
              <Star className="h-3 w-3" /> Zastosuj polecane
            </Button>
            <Button size="xs" onClick={resetCat} disabled={changedInCat === 0}>
              <RotateCcw className="h-3 w-3" /> Wyczyść kategorię
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {list.length === 0 && <div className="text-sm text-muted py-8 text-center">Brak wyników.</div>}
        {list.map((def) => (
          <SettingRow key={def.name} def={def} value={cvars[def.name]} onChange={(v) => setCvar(def.name, v)} onRemove={() => removeCvar(def.name)} />
        ))}
      </div>
      <p className="text-[11px] text-muted">
        <EyeOff className="inline h-3 w-3 mr-1" />
        „ukryta” = cvar bez flagi release: nie podpowiada się w konsoli, ale da się ustawić z autoexec. Pełną listę (5000+) znajdziesz w zakładce
        Komendy.
      </p>
    </div>
  );
}

function SettingRow({
  def,
  value,
  onChange,
  onRemove,
}: {
  def: SettingDef;
  value: string | undefined;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  const enabled = value !== undefined;
  const current = value ?? def.default;

  return (
    <Card className={cn("p-3 transition-colors duration-150 ease", enabled && "border-accent/40 bg-accent/[0.035]")}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium">{def.label}</span>
            <code className="font-mono text-[11px] text-accent2">{def.name}</code>
            {def.hidden && (
              <Badge tone="cyan" title="Brak flagi release – nie podpowiada się w konsoli">
                ukryta
              </Badge>
            )}
            {enabled && <Badge tone="amber">w cfg</Badge>}
          </div>
          {def.desc && <div className="text-xs text-muted mt-0.5">{def.desc}</div>}
          <div className="text-[11px] text-muted/80 mt-0.5 font-mono tnum">
            domyślnie: {def.default === "" ? '""' : def.default}
            {def.recommended !== undefined && (
              <>
                {" · "}
                <button className="text-accent-hi hover:underline underline-offset-2" onClick={() => onChange(def.recommended!)} title="Ustaw polecaną wartość">
                  polecane: {def.recommended}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 lg:w-[300px]">
          <SettingControl def={def} value={current} onChange={onChange} />
          {enabled ? (
            <Button size="xs" variant="ghost" onClick={onRemove} title="Usuń z cfg (wróć do domyślnego)">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="xs" onClick={() => onChange(current)} title="Dodaj do cfg z bieżącą wartością">
              Dodaj
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function SettingControl({ def, value, onChange }: { def: SettingDef; value: string; onChange: (v: string) => void }) {
  if (def.type === "bool") {
    const on = normalizeBool(value) === "1";
    return (
      <div className="flex-1 flex justify-end">
        <Toggle checked={on} onChange={(v) => onChange(v ? "1" : "0")} label={on ? "Włączone" : "Wyłączone"} />
      </div>
    );
  }
  if (def.type === "enum") {
    return (
      <Select className="flex-1" value={value} onChange={(e) => onChange(e.target.value)}>
        {def.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} ({o.value})
          </option>
        ))}
        {!def.options?.some((o) => o.value === value) && <option value={value}>{value}</option>}
      </Select>
    );
  }
  if (def.type === "number") {
    const n = Number(value);
    return (
      <div className="flex-1 flex items-center gap-2">
        <input
          type="range"
          className="flex-1 min-w-[80px]"
          min={def.min}
          max={def.max}
          step={def.step}
          value={Number.isFinite(n) ? n : def.min ?? 0}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          type="number"
          className="w-[84px] font-mono"
          min={def.min}
          max={def.max}
          step={def.step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
  return <Input className="flex-1 w-full font-mono" value={value} onChange={(e) => onChange(e.target.value)} />;
}
