"use client";
import { useMemo, useState } from "react";
import { Search, RotateCcw, Star, EyeOff, ChevronRight, Plus } from "lucide-react";
import { SETTINGS, SETTING_CATEGORIES } from "@/data/settings";
import { useStore } from "@/lib/store";
import type { SettingDef } from "@/lib/types";
import { cn, normalizeBool } from "@/lib/utils";
import { Badge, Button, Card, Chip, IconButton, Input, PageHeader, Select, Toggle } from "../ui/ui";

export function SettingsTab() {
  const [cat, setCat] = useState<string>("radar");
  const [q, setQ] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
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
  const grouped = q || onlyChanged;

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
      <PageHeader title="Ustawienia" desc="Najważniejsze cvary CS2. Kropka oznacza wartość zapisaną w autoexec.cfg. Rozwiń wiersz, żeby zobaczyć opis.">
        <Toggle checked={showDesc} onChange={setShowDesc} label="Pokaż opisy" />
        <Toggle checked={onlyChanged} onChange={setOnlyChanged} label="Tylko ustawione" />
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative md:w-72 shrink-0">
          <Search className="h-4 w-4 text-muted absolute left-2.5 top-2" strokeWidth={1.75} />
          <Input className="pl-8 w-full" placeholder="Szukaj ustawienia…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {!q && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {SETTING_CATEGORIES.map((c) => {
              const n = SETTINGS.filter((s) => s.category === c.id && cvars[s.name] !== undefined).length;
              return (
                <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
                  {c.label}
                  {n > 0 && (
                    <span className={cn("ml-1.5 rounded-full px-1.5 text-[10px] tnum", cat === c.id ? "bg-white/20 text-white" : "bg-accent/15 text-accent-hi")}>
                      {n}
                    </span>
                  )}
                </Chip>
              );
            })}
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        {!grouped && category && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between px-3 py-2 border-b border-border bg-panel2/60">
            <div className="min-w-0">
              <span className="text-[13px] font-semibold tracking-tight">{category.label}</span>
              {category.desc && <span className="hidden lg:inline text-xs text-muted ml-2">{category.desc}</span>}
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Button variant="primary" size="xs" icon onClick={applyRecommended}>
                <Star className="h-3 w-3" /> Zastosuj polecane
              </Button>
              <Button size="xs" icon onClick={resetCat} disabled={changedInCat === 0}>
                <RotateCcw className="h-3 w-3" /> Wyczyść
              </Button>
            </div>
          </div>
        )}
        {list.length === 0 && <div className="text-sm text-muted py-10 text-center">Brak wyników.</div>}
        <div className="divide-y divide-border">
          {list.map((def) => (
            <SettingRow
              key={def.name}
              def={def}
              value={cvars[def.name]}
              forceOpen={showDesc}
              showCategory={!!grouped}
              onChange={(v) => setCvar(def.name, v)}
              onRemove={() => removeCvar(def.name)}
            />
          ))}
        </div>
      </Card>
      <p className="text-[11px] text-muted flex items-center gap-1.5">
        <EyeOff className="h-3 w-3" strokeWidth={1.5} />
        „ukryta” = cvar bez flagi release: nie podpowiada się w konsoli, ale da się ustawić z autoexec. Pełna lista jest w zakładce Komendy.
      </p>
    </div>
  );
}

function SettingRow({
  def,
  value,
  forceOpen,
  showCategory,
  onChange,
  onRemove,
}: {
  def: SettingDef;
  value: string | undefined;
  forceOpen: boolean;
  showCategory: boolean;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const enabled = value !== undefined;
  const current = value ?? def.default;
  const expanded = forceOpen || open;
  const catLabel = SETTING_CATEGORIES.find((c) => c.id === def.category)?.label;

  return (
    <div className="srow" data-set={enabled || undefined}>
      <div className="min-w-0 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={expanded}
          aria-label="Pokaż opis"
          className="btn shrink-0 rounded-md p-0.5 text-muted hover:text-text hover:bg-panel3"
        >
          <ChevronRight className={cn("h-3.5 w-3.5 transition-transform duration-150 ease-out", expanded && "rotate-90")} strokeWidth={2} />
        </button>
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-150", enabled ? "bg-accent" : "bg-border2")}
          title={enabled ? "Zapisane w cfg" : "Nieustawione (wartość domyślna gry)"}
        />
        <span className="text-[13px] font-medium truncate" title={def.desc || undefined}>
          {def.label}
        </span>
        <code className="hidden md:inline font-mono text-[11px] text-muted truncate">{def.name}</code>
        {def.hidden && (
          <Badge tone="cyan" title="Brak flagi release – nie podpowiada się w konsoli">
            ukryta
          </Badge>
        )}
        {showCategory && catLabel && <Badge tone="gray">{catLabel}</Badge>}
      </div>
      <div className="flex items-center gap-1.5 justify-end">
        <SettingControl def={def} value={current} onChange={onChange} />
        {enabled ? (
          <IconButton onClick={onRemove} title="Usuń z cfg (wróć do domyślnego)" aria-label="Usuń z cfg">
            <RotateCcw className="h-3.5 w-3.5" />
          </IconButton>
        ) : (
          <IconButton onClick={() => onChange(current)} title="Dodaj do cfg z bieżącą wartością" aria-label="Dodaj do cfg">
            <Plus className="h-3.5 w-3.5" />
          </IconButton>
        )}
      </div>
      {expanded && (
        <div className="srow-desc pop-in pl-8 pr-2 pb-1.5 pt-0.5 text-xs text-muted leading-snug">
          {def.desc && <span>{def.desc} </span>}
          <span className="font-mono text-[11px] tnum">
            domyślnie: {def.default === "" ? '""' : def.default}
            {def.recommended !== undefined && (
              <>
                {" · "}
                <button
                  className="text-accent-hi hover:underline underline-offset-2"
                  onClick={() => onChange(def.recommended!)}
                  title="Ustaw polecaną wartość"
                >
                  polecane: {def.recommended}
                </button>
              </>
            )}
          </span>
          {def.note && <div className="text-warn mt-0.5">{def.note}</div>}
        </div>
      )}
    </div>
  );
}

function SettingControl({ def, value, onChange }: { def: SettingDef; value: string; onChange: (v: string) => void }) {
  if (def.type === "bool") {
    const on = normalizeBool(value) === "1";
    return (
      <div className="flex items-center gap-2">
        <span className={cn("hidden sm:inline text-[11px] tnum w-16 text-right", on ? "text-text" : "text-muted")}>{on ? "włączone" : "wyłączone"}</span>
        <Toggle checked={on} onChange={(v) => onChange(v ? "1" : "0")} />
      </div>
    );
  }
  if (def.type === "enum") {
    return (
      <Select className="h-7 w-[190px] text-[11.5px]" value={value} onChange={(e) => onChange(e.target.value)}>
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
      <div className="flex items-center gap-2">
        <input
          type="range"
          className="hidden lg:block w-[110px]"
          min={def.min}
          max={def.max}
          step={def.step}
          value={Number.isFinite(n) ? n : def.min ?? 0}
          onChange={(e) => onChange(e.target.value)}
          aria-label={def.label}
        />
        <Input
          type="number"
          className="h-7 w-[76px] font-mono tnum"
          min={def.min}
          max={def.max}
          step={def.step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={def.label}
        />
      </div>
    );
  }
  return <Input className="h-7 w-[190px] font-mono" value={value} onChange={(e) => onChange(e.target.value)} aria-label={def.label} />;
}
