import { randomInt } from 'crypto';

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomCode(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

function datePart(date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

/** e.g. SF-261004-7KQ2 */
export function generateOrderNumber(): string {
  return `SF-${datePart()}-${randomCode(4)}`;
}

/** e.g. RQ-261004-M3XA */
export function generateRequestNumber(): string {
  return `RQ-${datePart()}-${randomCode(4)}`;
}
