/**
 * Age ranges were previously free text in the admin form, so the same bucket
 * ended up stored as "4-8", "4Y-8Y", "4-8 Years"... which fragmented the shop
 * filters. Everything is normalised to a single canonical label before it is
 * grouped, compared or displayed.
 */
export const AGE_RANGE_OPTIONS = [
  "0-1Y",
  "1-2Y",
  "1-4Y",
  "2-5Y",
  "4-8Y",
  "5-8Y",
  "8-12Y",
] as const;

/** "4-8", "4y - 8y", "4-8 Years" -> "4-8Y" */
export function normalizeAgeRange(raw?: string): string {
  if (!raw) return "";
  const cleaned = raw.trim();
  if (!cleaned) return "";

  const match = cleaned.match(/(\d+)\s*(?:y(?:ears?)?)?\s*[-–to]+\s*(\d+)/i);
  if (match) return `${Number(match[1])}-${Number(match[2])}Y`;

  const single = cleaned.match(/^(\d+)\s*y(?:ears?)?$/i);
  if (single) return `${Number(single[1])}Y`;

  return cleaned;
}

/** Sorts canonical labels by their starting age instead of alphabetically. */
export function compareAgeRange(a: string, b: string): number {
  const start = (v: string) => {
    const m = v.match(/\d+/);
    return m ? Number(m[0]) : Number.MAX_SAFE_INTEGER;
  };
  return start(a) - start(b) || a.localeCompare(b);
}
