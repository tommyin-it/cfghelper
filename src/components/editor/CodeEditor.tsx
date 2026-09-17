"use client";
import { useMemo, useRef } from "react";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Proste podświetlanie składni cfg (komentarze, stringi, słowa kluczowe, nazwy komend, liczby). */
export function highlightCfg(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const ci = line.indexOf("//");
      let code = line;
      let comment = "";
      // komentarz tylko poza cudzysłowem (przybliżenie: liczymy cudzysłowy przed //)
      if (ci >= 0 && (line.slice(0, ci).split('"').length - 1) % 2 === 0) {
        code = line.slice(0, ci);
        comment = line.slice(ci);
      }
      const parts: string[] = [];
      const re = /("[^"]*"?)|(\b(bind|alias|unbind|unbindall|exec|echo|toggle|incrementvar|host_writeconfig)\b)|(^\s*[+-]?[A-Za-z_][\w.]*)|(\b-?\d+(\.\d+)?\b)|(\S+)|(\s+)/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(code))) {
        if (m[1]) parts.push(`<span class="tok-s">${esc(m[1])}</span>`);
        else if (m[2]) parts.push(`<span class="tok-k">${esc(m[2])}</span>`);
        else if (m[4]) parts.push(`<span class="tok-n">${esc(m[4])}</span>`);
        else if (m[5]) parts.push(`<span class="tok-v">${esc(m[5])}</span>`);
        else parts.push(esc(m[0]));
      }
      if (comment) parts.push(`<span class="tok-c">${esc(comment)}</span>`);
      return parts.join("");
    })
    .join("\n");
}

export function CodeEditor({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const html = useMemo(() => highlightCfg(value) + "\n", [value]);
  const lines = useMemo(() => value.split("\n").length, [value]);

  const onScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = t.scrollTop;
      preRef.current.scrollLeft = t.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = t.scrollTop;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const t = e.currentTarget;
      const s = t.selectionStart;
      const en = t.selectionEnd;
      const nv = value.slice(0, s) + "\t" + value.slice(en);
      onChange(nv);
      requestAnimationFrame(() => {
        t.selectionStart = t.selectionEnd = s + 1;
      });
    }
  };

  return (
    <div className={`code-editor rounded-md border border-border bg-bg ${className ?? ""}`}>
      <div ref={gutterRef} className="gutter">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <pre ref={preRef} aria-hidden dangerouslySetInnerHTML={{ __html: html }} />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder={placeholder}
        wrap="off"
      />
    </div>
  );
}
