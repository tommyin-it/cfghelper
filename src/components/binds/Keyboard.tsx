"use client";
import { FN_ROW, MAIN_ROWS, NAV_ROWS, SYS_ROW, ARROW_ROWS, NUMPAD_ROWS, MOUSE_KEYS, type KeyDef } from "@/data/keys";
import { cn } from "@/lib/utils";
import { Mouse } from "lucide-react";

interface Props {
  binds: Record<string, string>;
  selected: string | null;
  onSelect: (key: string) => void;
  /** mniejsze klawisze (np. w oknie wyboru klawisza) */
  compact?: boolean;
}

function KeyCap({ k, bind, selected, onSelect, extraClass }: { k: KeyDef; bind?: string; selected: boolean; onSelect: (id: string) => void; extraClass?: string }) {
  if (k.id.startsWith("__")) {
    return <div className="keycap spacer" style={{ width: `calc(var(--u) * ${k.w ?? 1} + var(--g) * ${(k.w ?? 1) - 1})` }} />;
  }
  const w = k.w ?? 1;
  return (
    <button
      type="button"
      className={cn("keycap", bind && "bound", selected && "selected", k.disabled && "disabled", extraClass)}
      style={{ width: `calc(var(--u) * ${w} + var(--g) * ${w - 1})` }}
      title={k.disabled ? `${k.id} – zarezerwowany przez grę` : bind ? `${k.id}: ${bind}` : k.id}
      onClick={() => !k.disabled && onSelect(k.id)}
      disabled={k.disabled}
    >
      {k.sub && !bind && <span className="sub">{k.sub}</span>}
      <span>{k.label}</span>
      {bind && <span className="cmd">{bind}</span>}
    </button>
  );
}

export function Keyboard({ binds, selected, onSelect, compact }: Props) {
  const row = (keys: KeyDef[], i: number) => (
    <div className="kb-row" key={i}>
      {keys.map((k, j) => (
        <KeyCap key={k.id + j} k={k} bind={binds[k.id]} selected={selected === k.id} onSelect={onSelect} />
      ))}
    </div>
  );

  return (
    <div className={cn("kb overflow-x-auto pb-2", compact && "kb-compact")}>
      <div className="flex flex-wrap gap-x-5 gap-y-3 items-start">
        <div>
          {row(FN_ROW, -1)}
          <div style={{ height: "var(--g)" }} />
          {MAIN_ROWS.map(row)}
        </div>
        <div>
          {row(SYS_ROW, -2)}
          <div style={{ height: "var(--g)" }} />
          {NAV_ROWS.map(row)}
          <div style={{ height: "calc(var(--u) + var(--g) * 2)" }} />
          {ARROW_ROWS.map(row)}
        </div>
        <div>
          <div style={{ height: "calc(var(--u) * 2 + var(--g) * 3)" }} />
          <div className="kb-numpad">
            {NUMPAD_ROWS.flat().map((k) => (
              <KeyCap
                key={k.id}
                k={{ ...k, w: 1 }}
                bind={binds[k.id]}
                selected={selected === k.id}
                onSelect={onSelect}
                extraClass={cn(k.h === 2 && "tall", k.w === 2 && "wide")}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted mb-1 flex items-center gap-1">
            <Mouse className="h-3 w-3" /> Mysz
          </div>
          <div className="grid grid-cols-2 gap-[var(--g)]">
            {MOUSE_KEYS.map((k) => (
              <button
                key={k.id}
                type="button"
                className={cn("keycap", binds[k.id] && "bound", selected === k.id && "selected")}
                style={{ width: "calc(var(--u) * 2)", height: "calc(var(--u) * 1.1)" }}
                title={binds[k.id] ? `${k.id}: ${binds[k.id]}` : k.id}
                onClick={() => onSelect(k.id)}
              >
                <span>{k.label}</span>
                <span className={binds[k.id] ? "cmd" : "sub"}>{binds[k.id] ?? k.id}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
