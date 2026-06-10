/** Formatações simples de data/hora para a UI (pt-BR). */

const MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

/** "2026-06-08" → "08/06/2026". Aceita também ISO completo. */
export function dataBR(iso: string): string {
  const somenteData = iso.slice(0, 10);
  const [ano, mes, dia] = somenteData.split('-');
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

/** "2026-06-08" → "08 jun". Útil para listas compactas. */
export function diaMesBR(iso: string): string {
  const [, mes, dia] = iso.slice(0, 10).split('-');
  const idx = Number(mes) - 1;
  if (!dia || idx < 0 || idx > 11) return iso;
  return `${dia} ${MESES[idx]}`;
}
