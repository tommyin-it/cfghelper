// Smoke test UI: node scripts/e2e-smoke.mjs [baseUrl]
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3123";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const log = (ok, msg) => { results.push([ok, msg]); console.log(`${ok ? "PASS" : "FAIL"} ${msg}`); };

// --- 1. overflow na mobile
{
  const ctx = await browser.newContext({ viewport: { width: 430, height: 900 } });
  const page = await ctx.newPage();
  for (const tab of ["settings", "binds", "presets", "commands", "editor", "help"]) {
    await page.goto(`${base}/?tab=${tab}`);
    await page.waitForTimeout(800);
    const w = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      wide: [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > 432 && getComputedStyle(e).overflowX !== "auto" && getComputedStyle(e).overflowX !== "scroll").slice(0,6).map(e => e.tagName + "." + [...e.classList].slice(0,4).join(".") + " r=" + Math.round(e.getBoundingClientRect().right)) }));
    log(w.sw <= w.cw + 1, `mobile ${tab}: scrollWidth=${w.sw} clientWidth=${w.cw} ${w.sw > w.cw + 1 ? JSON.stringify(w.wide) : ""}`);
  }
  await ctx.close();
}

// --- 2. desktop flow
{
  const ctx = await browser.newContext({ viewport: { width: 1700, height: 1100 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(`${base}/?tab=binds`);
  await page.waitForSelector(".keycap");
  // klik klawisza C → akcja slot6 → zapisz
  await page.click(".keycap[title='c']");
  await page.waitForSelector("text=Klawisz");
  await page.click("text=Granaty");
  await page.click("button:has-text('Smoke (slot8)')");
  await page.click("button:has-text('Zapisz')");
  await page.waitForTimeout(300);
  const preview = await page.textContent("aside pre");
  log(preview.includes('bind "c" "slot8"'), "bind c → slot8 w podglądzie");
  const boundC = await page.$eval(".keycap[title^='c:']", (e) => e.classList.contains("bound"));
  log(boundC, "klawisz C podświetlony jako bound");
  // capture: klawisz fizyczny
  await page.click("button:has-text('Wykryj naciśnięty klawisz')");
  await page.keyboard.press("F5");
  await page.waitForTimeout(200);
  const sel = await page.$eval(".keycap.selected", (e) => e.title);
  log(sel.startsWith("f5"), `capture F5 → zaznaczony ${sel}`);
  // capture wyłącza się po wykryciu klawisza – włącz ponownie przed testem kółka
  await page.click("button:has-text('Wykryj naciśnięty klawisz')");
  await page.mouse.move(600, 300);
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(200);
  const sel2 = await page.$eval(".keycap.selected", (e) => e.title);
  log(sel2.startsWith("mwheeldown"), `capture kółko ↓ → ${sel2}`);
  await page.keyboard.press("Escape");
  // buy builder
  await page.click(".keycap[title='kp_end']");
  await page.click("button:has-text('Kupowanie')");
  await page.click("button[title='buy ak47 · $2700']");
  await page.click("button[title='buy m4a1 · $3100']");
  await page.click("button:has-text('Wstaw do pola')");
  await page.click("button:has-text('Zapisz')");
  await page.waitForTimeout(300);
  const preview2 = await page.textContent("aside pre");
  log(preview2.includes('bind "kp_end" "buy ak47; buy m4a1"'), "buy bind kp_end");
  // ustawienia
  await page.click("nav button:has-text('Ustawienia')");
  await page.click("button:has-text('Zastosuj polecane')");
  await page.waitForTimeout(300);
  const preview3 = await page.textContent("aside pre");
  log(preview3.includes('cl_radar_scale "0.4"'), "polecane radar → cl_radar_scale 0.4");
  // presety
  await page.click("nav button:has-text('Polecane')");
  await page.locator("div.rounded-lg", { hasText: "Telemetria zawsze widoczna" }).first().locator("button", { hasText: "Dodaj do cfg" }).click();
  await page.waitForTimeout(300);
  const preview4 = await page.textContent("aside pre");
  log(preview4.includes('cl_hud_telemetry_ping_show "2"'), "preset telemetria dodany");
  // komendy
  await page.click("nav button:has-text('Komendy')");
  await page.fill("input[placeholder^='Szukaj: np. radar']", "engine_no_focus_sleep");
  await page.waitForTimeout(500);
  const hasHidden = await page.isVisible("text=engine_no_focus_sleep");
  log(hasHidden, "wyszukiwanie ukrytej komendy engine_no_focus_sleep");
  await page.fill("input[placeholder='wartość']", "0");
  await page.click("button:has-text('Dodaj')");
  await page.waitForTimeout(300);
  const preview5 = await page.textContent("aside pre");
  log(preview5.includes('engine_no_focus_sleep "0"'), "cvar z bazy dodany do cfg");
  // binduj z komend
  await page.fill("input[placeholder^='Szukaj: np. radar']", "toggleradarscale");
  await page.waitForTimeout(400);
  await page.click("button:has-text('Binduj')");
  await page.waitForSelector("[role=dialog] .keycap");
  await page.click("[role=dialog] .keycap[title='kp_minus']");
  await page.waitForTimeout(300);
  const preview6 = await page.textContent("aside pre");
  log(preview6.includes('bind "kp_minus" "toggleradarscale"'), "binduj z zakładki Komendy → okno wyboru → kp_minus");
  // okno wyboru klawisza: fizyczny klawisz + kółko + przycisk myszy
  await page.fill("input[placeholder^='Szukaj: np. radar']", "switchhands");
  await page.waitForTimeout(400);
  await page.click("button:has-text('Binduj')");
  await page.waitForSelector("[role=dialog]");
  await page.keyboard.press("F8");
  await page.waitForTimeout(300);
  log((await page.textContent("aside pre")).includes('bind "f8" "switchhands"'), "okno wyboru: fizyczny klawisz F8");
  await page.click("button:has-text('Binduj')");
  await page.waitForSelector("[data-testid=key-capture-zone]");
  const zone = await page.locator("[data-testid=key-capture-zone]").boundingBox();
  await page.mouse.move(zone.x + zone.width / 2, zone.y + zone.height / 2);
  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(300);
  log((await page.textContent("aside pre")).includes('bind "mwheelup" "switchhands"'), "okno wyboru: kółko w górę w strefie");
  await page.click("button:has-text('Binduj')");
  await page.waitForSelector("[data-testid=key-capture-zone]");
  await page.click("[data-testid=key-capture-zone]", { button: "right" });
  await page.waitForTimeout(300);
  log((await page.textContent("aside pre")).includes('bind "mouse2" "switchhands"'), "okno wyboru: PPM w strefie → mouse2");
  // presety: zmiana sugerowanego klawisza przez okno
  await page.click("nav button:has-text('Polecane')");
  const zoomCard = page.locator("div.rounded-lg", { hasText: "Zoom radaru na klawiszach" }).first();
  await zoomCard.locator("[data-testid=key-picker]").first().click();
  await page.waitForSelector("[role=dialog] .keycap");
  await page.click("[role=dialog] .keycap[title='f7']");
  await page.waitForTimeout(200);
  const pickerText = await zoomCard.locator("[data-testid=key-picker]").first().textContent();
  log(pickerText.trim() === "f7", `preset: klawisz zmieniony na ${pickerText.trim()}`);
  await zoomCard.locator("button", { hasText: "Dodaj do cfg" }).click();
  await page.waitForTimeout(300);
  log((await page.textContent("aside pre")).includes('bind "f7" "incrementvar cl_radar_scale 0.25 1.0 -0.05"'), "preset dodany z własnym klawiszem f7");
  // lista bindów: przeniesienie binda na inny klawisz
  await page.click("nav button:has-text('Bindy')");
  const row = page.locator("div.group", { hasText: "switchhands" }).first();
  await row.locator("[data-testid=key-picker]").click();
  await page.waitForSelector("[role=dialog] .keycap");
  await page.click("[role=dialog] .keycap[title='f11']");
  await page.waitForTimeout(300);
  log((await page.textContent("aside pre")).includes('bind "f11" "switchhands"'), "lista bindów: przeniesienie na f11");
  // edytor
  await page.click("nav button:has-text('Edytor')");
  page.once("dialog", (d) => d.accept("test.cfg"));
  await page.click("button:has-text('Nowy z generatora')");
  await page.waitForTimeout(500);
  const ta = await page.inputValue("textarea");
  log(ta.includes("bind \"c\" \"slot8\""), "edytor: nowy plik z generatora ma treść");
  const hl = await page.$eval(".code-editor pre", (e) => e.querySelectorAll(".tok-k").length);
  log(hl > 0, `edytor: podświetlanie (${hl} keywordów)`);
  await page.fill("textarea", 'bind "f9" "say gg"\nsensitivity 2.2\n');
  await page.waitForTimeout(700);
  page.once("dialog", (d) => d.accept());
  await page.click("button:has-text('Do generatora (dopisz)')");
  await page.waitForTimeout(400);
  await page.click("nav button:has-text('Ustawienia')");
  await page.waitForTimeout(300);
  const preview7 = await page.textContent("aside pre");
  log(preview7.includes('bind "f9" "say gg"') && preview7.includes('sensitivity "2.2"'), "import z edytora do generatora");
  await page.click("nav button:has-text('Edytor')");
  await page.waitForTimeout(300);
  const edH = await page.$eval(".code-editor", (e) => e.getBoundingClientRect().height);
  const noAside = (await page.$("aside")) === null;
  log(edH > 700 && noAside, `edytor: wysokość ${Math.round(edH)}px, panel podglądu ukryty=${noAside}`);
  // reload → persist
  await page.reload();
  await page.waitForTimeout(800);
  const preview8 = await page.textContent("aside pre");
  log(preview8.includes('bind "c" "slot8"'), "localStorage: stan przetrwał reload");
  // share link
  await page.click("nav button:has-text('Ustawienia')");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.click("button:has-text('Link')");
  await page.waitForTimeout(400);
  const link = await page.evaluate(() => navigator.clipboard.readText());
  log(link.includes("#g"), `share link: ${link.slice(0, 60)}…`);
  const ctx2 = await browser.newContext({ viewport: { width: 1700, height: 1100 } });
  const p2 = await ctx2.newPage();
  await p2.goto(link);
  await p2.waitForTimeout(800);
  const pv = await p2.textContent("pre");
  log(pv.includes('bind "c" "slot8"'), "share link odtwarza config w nowej sesji");
  await p2.screenshot({ path: "/tmp/shots/e2e-final.png" });
  await ctx2.close();
  log(errors.length === 0, `brak błędów JS w konsoli ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ""}`);
  await page.screenshot({ path: "/tmp/shots/e2e-settings.png" });
  await ctx.close();
}
await browser.close();
const fails = results.filter(([ok]) => !ok).length;
console.log(`\n${results.length - fails}/${results.length} PASS`);
process.exit(fails ? 1 : 0);
