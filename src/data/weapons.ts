export type Team = "ct" | "t" | "both";

export interface WeaponDef {
  /** nazwa do `buy <name>` */
  buy: string;
  label: string;
  team: Team;
  price: number;
  group: "pistols" | "smg" | "rifles" | "heavy" | "gear" | "grenades";
  /** odpowiednik dla drugiej strony (para T/CT w jednym bindzie) */
  pair?: string;
}

export const WEAPON_GROUPS: { id: WeaponDef["group"]; label: string }[] = [
  { id: "pistols", label: "Pistolety" },
  { id: "smg", label: "SMG" },
  { id: "rifles", label: "Karabiny" },
  { id: "heavy", label: "Ciężkie" },
  { id: "gear", label: "Wyposażenie" },
  { id: "grenades", label: "Granaty" },
];

export const WEAPONS: WeaponDef[] = [
  { buy: "glock", label: "Glock-18", team: "t", price: 200, group: "pistols", pair: "hkp2000" },
  { buy: "hkp2000", label: "P2000", team: "ct", price: 200, group: "pistols", pair: "glock" },
  { buy: "usp_silencer", label: "USP-S", team: "ct", price: 200, group: "pistols", pair: "glock" },
  { buy: "elite", label: "Dual Berettas", team: "both", price: 300, group: "pistols" },
  { buy: "p250", label: "P250", team: "both", price: 300, group: "pistols" },
  { buy: "tec9", label: "Tec-9", team: "t", price: 500, group: "pistols", pair: "fiveseven" },
  { buy: "fiveseven", label: "Five-SeveN", team: "ct", price: 500, group: "pistols", pair: "tec9" },
  { buy: "cz75a", label: "CZ75-Auto", team: "both", price: 500, group: "pistols" },
  { buy: "deagle", label: "Desert Eagle", team: "both", price: 700, group: "pistols" },
  { buy: "revolver", label: "R8 Revolver", team: "both", price: 600, group: "pistols" },

  { buy: "mac10", label: "MAC-10", team: "t", price: 1050, group: "smg", pair: "mp9" },
  { buy: "mp9", label: "MP9", team: "ct", price: 1250, group: "smg", pair: "mac10" },
  { buy: "mp7", label: "MP7", team: "both", price: 1500, group: "smg" },
  { buy: "mp5sd", label: "MP5-SD", team: "both", price: 1500, group: "smg" },
  { buy: "ump45", label: "UMP-45", team: "both", price: 1200, group: "smg" },
  { buy: "p90", label: "P90", team: "both", price: 2350, group: "smg" },
  { buy: "bizon", label: "PP-Bizon", team: "both", price: 1400, group: "smg" },

  { buy: "galilar", label: "Galil AR", team: "t", price: 1800, group: "rifles", pair: "famas" },
  { buy: "famas", label: "FAMAS", team: "ct", price: 2050, group: "rifles", pair: "galilar" },
  { buy: "ak47", label: "AK-47", team: "t", price: 2700, group: "rifles", pair: "m4a1" },
  { buy: "m4a1", label: "M4A4", team: "ct", price: 3100, group: "rifles", pair: "ak47" },
  { buy: "m4a1_silencer", label: "M4A1-S", team: "ct", price: 2900, group: "rifles", pair: "ak47" },
  { buy: "ssg08", label: "SSG 08", team: "both", price: 1700, group: "rifles" },
  { buy: "sg556", label: "SG 553", team: "t", price: 3000, group: "rifles", pair: "aug" },
  { buy: "aug", label: "AUG", team: "ct", price: 3300, group: "rifles", pair: "sg556" },
  { buy: "awp", label: "AWP", team: "both", price: 4750, group: "rifles" },
  { buy: "g3sg1", label: "G3SG1", team: "t", price: 5000, group: "rifles", pair: "scar20" },
  { buy: "scar20", label: "SCAR-20", team: "ct", price: 5000, group: "rifles", pair: "g3sg1" },

  { buy: "nova", label: "Nova", team: "both", price: 1050, group: "heavy" },
  { buy: "xm1014", label: "XM1014", team: "both", price: 2000, group: "heavy" },
  { buy: "sawedoff", label: "Sawed-Off", team: "t", price: 1300, group: "heavy", pair: "mag7" },
  { buy: "mag7", label: "MAG-7", team: "ct", price: 1300, group: "heavy", pair: "sawedoff" },
  { buy: "m249", label: "M249", team: "both", price: 5200, group: "heavy" },
  { buy: "negev", label: "Negev", team: "both", price: 1700, group: "heavy" },

  { buy: "vest", label: "Kamizelka", team: "both", price: 650, group: "gear" },
  { buy: "vesthelm", label: "Kamizelka + hełm", team: "both", price: 1000, group: "gear" },
  { buy: "defuser", label: "Zestaw do rozbrajania", team: "ct", price: 400, group: "gear" },
  { buy: "taser", label: "Zeus x27", team: "both", price: 200, group: "gear" },

  { buy: "hegrenade", label: "Granat HE", team: "both", price: 300, group: "grenades" },
  { buy: "flashbang", label: "Flash", team: "both", price: 200, group: "grenades" },
  { buy: "smokegrenade", label: "Smoke", team: "both", price: 300, group: "grenades" },
  { buy: "molotov", label: "Molotov", team: "t", price: 400, group: "grenades", pair: "incgrenade" },
  { buy: "incgrenade", label: "Incendiary", team: "ct", price: 500, group: "grenades", pair: "molotov" },
  { buy: "decoy", label: "Decoy", team: "both", price: 50, group: "grenades" },
];

export const WEAPON_BY_BUY: Record<string, WeaponDef> = Object.fromEntries(WEAPONS.map((w) => [w.buy, w]));

/** Suma kosztów listy zakupów dla danej strony. */
export function buyCost(items: string[], team: "ct" | "t"): number {
  return items.reduce((sum, b) => {
    const w = WEAPON_BY_BUY[b];
    if (!w) return sum;
    if (w.team === "both" || w.team === team) return sum + w.price;
    return sum;
  }, 0);
}
