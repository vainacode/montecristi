import "server-only";
import { fuelData as fallbackFuelData, type FuelData, type FuelItem } from "@/data/fuels";

/**
 * Precios de combustibles desde combustibles.do (publica cada viernes los precios
 * oficiales del MICM, vigentes de sábado a viernes). Si la página no responde o
 * cambia de formato, se usan los precios de respaldo de src/data/fuels.ts.
 */
const SOURCE_URL = "https://combustibles.do/";
const REVALIDATE_SECONDS = 3 * 60 * 60; // cada 3 horas: el cambio del viernes llega el mismo día

// Nombres con que combustibles.do puede rotular cada combustible (en orden de preferencia).
const LABELS: Record<string, string[]> = {
  "gasolina-premium": ["Gasolina Premium"],
  "gasolina-regular": ["Gasolina Regular"],
  "gasoil-optimo": ["Gasoil Óptimo", "Gasoil Optimo"],
  "gasoil-regular": ["Gasoil Regular"],
  "glp": ["Gas Licuado de Petróleo", "Gas Licuado", "GLP"],
  "gas-natural": ["Gas Natural"],
  "avtur": ["Avtur"],
  "kerosene": ["Kerosene", "Kerosén", "Keroseno"],
  "fuel-oil-6": ["Fuel Oil"],
};

function htmlToText(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#36;|&dollar;/g, "$")
    .replace(/\s+/g, " ");
}

const toNumber = (raw: string) => Number(raw.replace(/,/g, ""));
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Busca el precio (y la variación, si aparece) que sigue al nombre del combustible. */
function findFuel(text: string, labels: string[]): { price: number; delta: number | null } | null {
  for (const label of labels) {
    const re = new RegExp(
      // Tras el nombre se salta cualquier texto que no sea un precio (p. ej. el "#6" de "Fuel Oil #6").
      `${escapeRegex(label)}(?:(?!\\d{1,3}(?:,\\d{3})*\\.\\d{2}).){0,80}?(?:RD)?\\$?\\s*(\\d{1,3}(?:,\\d{3})*\\.\\d{2})` +
        // Variación opcional: "↓ 3.00", "-RD$3.00", "+ 2.50", "baja RD$1.00"...
        `(?:[^0-9]{0,40}?([+\\-−▲▼↑↓]|sube|subi[oó]|baja|baj[oó]|aument[oó]|disminuy[oó])\\s*(?:RD)?\\$?\\s*(\\d{1,3}(?:\\.\\d{1,2})?))?`,
      "i",
    );
    const m = text.match(re);
    if (!m) continue;
    const price = toNumber(m[1]);
    if (!(price > 0 && price < 2000)) continue;
    let delta: number | null = null;
    if (m[2] && m[3]) {
      const down = /[-−▼↓]|baj|dismin/i.test(m[2]);
      delta = toNumber(m[3]) * (down ? -1 : 1);
    }
    return { price, delta };
  }
  return null;
}

export function parseFuelPage(html: string): FuelData | null {
  const text = htmlToText(html);
  let found = 0;

  const fuels: FuelItem[] = fallbackFuelData.fuels.map((base) => {
    const hit = findFuel(text, LABELS[base.id] ?? [base.name]);
    if (!hit) return base;
    found++;
    const delta = hit.delta ?? 0;
    return {
      ...base,
      price: hit.price,
      delta,
      previousPrice: Number((hit.price - delta).toFixed(2)),
      trend: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
    };
  });

  // Si no reconocimos al menos las gasolinas y los gasoil, el formato cambió: usamos el respaldo.
  if (found < 4) return null;

  const range = text.match(/semana del?\s+\d{1,2}(?:\s+de\s+[a-záéíóú]+)?\s+al\s+\d{1,2}\s+de\s+[a-záéíóú]+(?:\s+(?:de|del)\s+\d{4})?/i)?.[0];
  const premium = fuels.find((f) => f.id === "gasolina-premium")!;
  const regular = fuels.find((f) => f.id === "gasolina-regular")!;
  const gasoilOptimo = fuels.find((f) => f.id === "gasoil-optimo")!;
  const glp = fuels.find((f) => f.id === "glp")!;

  return {
    lastUpdated: fallbackFuelData.lastUpdated,
    validRange: range ? range.charAt(0).toUpperCase() + range.slice(1) : fallbackFuelData.validRange,
    source: fallbackFuelData.source,
    fuels,
    history: [
      { week: "Anterior", premium: premium.previousPrice, regular: regular.previousPrice, gasoilOptimo: gasoilOptimo.previousPrice, glp: glp.previousPrice },
      { week: "Vigente", premium: premium.price, regular: regular.price, gasoilOptimo: gasoilOptimo.price, glp: glp.price },
    ],
  };
}

export async function getFuelData(): Promise<FuelData> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(SOURCE_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "es-DO,es;q=0.9",
      },
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
    }).finally(() => clearTimeout(timer));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const parsed = parseFuelPage(await res.text());
    if (!parsed) throw new Error("Formato de combustibles.do no reconocido");
    return parsed;
  } catch (e) {
    console.error("[Combustibles] Usando precios de respaldo:", e);
    return fallbackFuelData;
  }
}
