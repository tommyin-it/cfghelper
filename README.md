# CFG Helper – generator autoexec.cfg do CS2

Prosta aplikacja webowa do budowania configu (autoexec.cfg) do Counter-Strike 2. Działa w 100% w przeglądarce, dane zapisuje w localStorage.

## Funkcje

- **Ustawienia** – kuratorowana lista najważniejszych cvarów (radar, viewmodel, HUD, mysz, dźwięk, wideo, sieć, rozgrywka) z polskimi opisami, suwakami, wartościami domyślnymi i polecanymi.
- **Bindy** – wizualna klawiatura (pełna + numpad + mysz), wykrywanie fizycznie naciśniętego klawisza/przycisku/kółka, edytor binda z akcjami, generatorem buy-bindów (koszty T/CT) i wyszukiwarką komend.
- **Polecane** – gotowe presety: zoom radaru, granaty na klawiszach, buy bindy, telemetria (zamiennik net_graph), dźwięk pod granie, trening (sv_cheats), jumpthrow legalny w MM i inne.
- **Komendy** – baza 5100+ komend i cvarów CS2, w tym ukrytych (bez flagi `release`) i dev-only, z flagami, domyślnymi wartościami i opisami. Dodawanie do cfg lub bindowanie jednym kliknięciem.
- **Edytor** – wbudowany edytor tekstowy z podświetlaniem składni, wieloma plikami, autozapisem, importem `.cfg`/`.vcfg` i eksportem.
- **Sugestie** – analiza configu: ostrzeżenia (bindy blokowane w MM, `snd_musicvolume 0`, bindy wymagające sv_cheats) i podpowiedzi z przyciskiem „zastosuj”.
- **Podgląd na żywo**, pobieranie, kopiowanie, link udostępniający (config zakodowany w URL), instrukcja instalacji i opcje uruchamiania.

Celownik (crosshair) celowo nie jest częścią generatora.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · zustand · lucide-react. Deploy: Vercel.

## Uruchomienie

```bash
pnpm install
pnpm dev
```

## Baza komend

`public/data/commands.json` jest generowany skryptem:

```bash
python3 scripts/build-commands.py
```

Źródła (w `data/raw/`):

- [ArmynC/ArminC-CS2-Cvars](https://github.com/ArmynC/ArminC-CS2-Cvars) – v1.40.7.9 (maj 2025): nazwy, domyślne wartości, opisy
- [SuGolYolLom/CS2-Cvars-Cmds](https://github.com/SuGolYolLom/CS2-Cvars-Cmds) – v1.40.5.1 (listopad 2024): flagi `devonly` / `hidden`

Widoczność: `release` = widoczna w konsoli, `hidden` = bez flagi release (nie podpowiada się, zwykle da się ustawić), `dev` = tylko build deweloperski.

## Licencja

MIT. Dane cvarów: CC0 (źródła powyżej).
