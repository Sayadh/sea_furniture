/**
 * Normalizes Armenian phone numbers to +374XXXXXXXX.
 * Accepts: +374 XX XXX XXX, 00374..., 374..., 0XX XXX XXX.
 * Returns null when the number is not valid.
 */
export function normalizeArmenianPhone(raw: string): string | null {
  const compact = raw.replace(/[\s\-().]/g, '');
  const match = /^(?:\+374|00374|374|0)(\d{8})$/.exec(compact);
  return match ? `+374${match[1]}` : null;
}
