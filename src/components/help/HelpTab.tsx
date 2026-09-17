"use client";
import { Copy, FolderOpen, Rocket, CircleHelp, Terminal } from "lucide-react";
import { useStore } from "@/lib/store";
import { copyText } from "@/lib/utils";
import { Button, Card, Code, Kbd, SectionTitle } from "../ui/ui";

const PATHS = [
  { os: "Windows", path: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo\\cfg\\autoexec.cfg" },
  { os: "macOS", path: "~/Library/Application Support/Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/autoexec.cfg" },
  { os: "Linux", path: "~/.local/share/Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/autoexec.cfg" },
];

const LAUNCH = "-console -fullscreen -high -nojoy +exec autoexec.cfg";

export function HelpTab() {
  const toast = useStore((s) => s.toast);
  const copy = async (t: string) => {
    await copyText(t);
    toast("Skopiowano");
  };
  return (
    <div className="space-y-3 max-w-4xl">
      <Card className="p-4">
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <FolderOpen className="h-4 w-4 text-accent" /> 1. Gdzie wgrać autoexec.cfg
          </span>
        </SectionTitle>
        <ol className="text-sm space-y-2 list-decimal pl-5">
          <li>
            Pobierz plik przyciskiem <b>Pobierz</b> w panelu podglądu (albo z Edytora).
          </li>
          <li>
            Wgraj go do folderu <Code>cfg</Code> gry. Najprościej: Steam → biblioteka → CS2 → PPM → <i>Zarządzaj</i> → <i>Przeglądaj pliki lokalne</i>,
            potem <Code>game\csgo\cfg</Code>.
          </li>
        </ol>
        <div className="mt-3 space-y-1.5">
          {PATHS.map((p) => (
            <div key={p.os} className="flex items-center gap-2 rounded-md border border-border bg-panel2 px-2 py-1.5">
              <span className="text-[11px] font-semibold text-muted w-16 shrink-0">{p.os}</span>
              <code className="font-mono text-[11px] text-text flex-1 break-all">{p.path}</code>
              <button className="text-muted hover:text-text" onClick={() => copy(p.path)} title="Kopiuj ścieżkę">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">
          Niektóre poradniki podają też <Code>Steam\userdata\&lt;SteamID&gt;\730\local\cfg\</Code> – ten folder również działa.
        </p>
      </Card>

      <Card className="p-4">
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <Rocket className="h-4 w-4 text-accent" /> 2. Opcje uruchamiania (launch options)
          </span>
        </SectionTitle>
        <p className="text-sm">
          CS2 wczytuje <Code>autoexec.cfg</Code> automatycznie, ale dla pewności dodaj <Code>+exec autoexec.cfg</Code> w Steam → CS2 → Właściwości →
          Opcje uruchamiania:
        </p>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2">
          <code className="font-mono text-xs text-accent-hi flex-1">{LAUNCH}</code>
          <Button size="xs" onClick={() => copy(LAUNCH)}>
            <Copy className="h-3 w-3" /> Kopiuj
          </Button>
        </div>
        <ul className="text-xs text-muted mt-3 space-y-1 list-disc pl-5">
          <li>
            <Code>-console</Code> włącza konsolę, <Code>-high</Code> wysoki priorytet procesu, <Code>-nojoy</Code> wyłącza obsługę padów,{" "}
            <Code>-fullscreen</Code> pełny ekran.
          </li>
          <li>
            Opcjonalnie: <Code>-vulkan</Code> (renderer Vulkan), <Code>-noreflex</Code> (wyłącz NVIDIA Reflex), <Code>-refresh 240</Code> (odświeżanie).
          </li>
          <li>
            <span className="text-warn">Martwe w CS2</span> (nie używaj): <Code>-novid</Code>, <Code>-tickrate 128</Code>, <Code>-threads</Code>,{" "}
            <Code>-d3d9ex</Code>.
          </li>
        </ul>
      </Card>

      <Card className="p-4">
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-accent" /> 3. Sprawdź, czy config się wczytał
          </span>
        </SectionTitle>
        <p className="text-sm">
          Otwórz konsolę (<Kbd>`</Kbd>) i wpisz <Code>exec autoexec</Code>. Jeśli w cfg jest linia <Code>echo</Code>, zobaczysz komunikat. Możesz też
          wpisać nazwę cvara, np. <Code>cl_radar_scale</Code> – konsola pokaże aktualną wartość.
        </p>
        <p className="text-xs text-muted mt-2">
          Pojedyncze bindy możesz wkleić bezpośrednio do konsoli. Wiele linii naraz wklejaj tylko do pliku.
        </p>
      </Card>

      <Card className="p-4">
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <CircleHelp className="h-4 w-4 text-accent" /> FAQ
          </span>
        </SectionTitle>
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-semibold">Co znaczy „ukryta” komenda?</div>
            <p className="text-xs text-muted">
              W CS2 w konsoli podpowiadają się tylko cvary z flagą <Code>release</Code>. Pozostałe (np. <Code>viewmodel_fov</Code>,{" "}
              <Code>engine_no_focus_sleep</Code>, <Code>cl_crosshair_recoil</Code>) nie pojawią się w autouzupełnianiu, ale zwykle da się je ustawić z
              autoexec. „Dev-only” to cvary tylko dla buildów deweloperskich – w normalnej grze nie zadziałają.
            </p>
          </div>
          <div>
            <div className="font-semibold">Jumpthrow bind nie działa w matchmakingu?</div>
            <p className="text-xs text-muted">
              Od 19.08.2024 oficjalne serwery Valve blokują bindy łączące kilka akcji ruchu/ataku w jednym naciśnięciu. Legalna alternatywa: osobny
              klawisz z <Code>-attack</Code> naciśnięty w locie (preset „Jumpthrow legalny w MM”). Klasyczny alias działa na serwerach community.
            </p>
          </div>
          <div>
            <div className="font-semibold">Buy bind nic nie kupuje</div>
            <p className="text-xs text-muted">
              Broń musi być w twoim loadoucie (ekwipunek w menu gry). <Code>buy ak47; buy m4a1</Code> w jednym bindzie jest OK – gra kupi tę, którą
              możesz kupić po swojej stronie.
            </p>
          </div>
          <div>
            <div className="font-semibold">Po co host_writeconfig na końcu?</div>
            <p className="text-xs text-muted">
              Zapisuje ustawienia do plików configu gry, żeby przetrwały restart. Możesz to wyłączyć w opcjach generowania.
            </p>
          </div>
          <div>
            <div className="font-semibold">Mam już autoexec – jak go wczytać?</div>
            <p className="text-xs text-muted">
              Zakładka Edytor → „Wczytaj z dysku” (.cfg lub .vcfg ze Steam: <Code>cs2_user_keys_0_slot0.vcfg</Code>,{" "}
              <Code>cs2_user_convars_0_slot0.vcfg</Code>) → „Do generatora”. Wszystkie bindy pojawią się na klawiaturze.
            </p>
          </div>
          <div>
            <div className="font-semibold">Gdzie są moje dane?</div>
            <p className="text-xs text-muted">
              Wszystko działa w przeglądarce i jest zapisywane w localStorage tej przeglądarki. Przycisk „Link” koduje cały config w adresie URL –
              możesz go wysłać komuś albo otworzyć na innym komputerze.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
