/**
 * Serializa datos estructurados para <script type="application/ld+json">.
 * Escapa "<" para que un título con "</script>" no pueda cerrar la etiqueta.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
