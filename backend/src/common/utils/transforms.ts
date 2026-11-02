import { Transform } from 'class-transformer';
import { sanitizeText } from './sanitize';
import { normalizeArmenianPhone } from './phone';

/** Trims + strips HTML. Empty strings become undefined (treated as "not provided"). */
export function SanitizedText(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const clean = sanitizeText(value);
    return clean.length ? clean : undefined;
  });
}

/** Same as SanitizedText, but empty string becomes null (used to clear optional fields on update). */
export function NullableText(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === null) return null;
    if (typeof value !== 'string') return value;
    const clean = sanitizeText(value);
    return clean.length ? clean : null;
  });
}

/** Normalizes an Armenian phone number; invalid input is left as-is so validation fails. */
export function NormalizePhone(opts: { nullable?: boolean } = {}): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return opts.nullable ? null : undefined;
    return normalizeArmenianPhone(trimmed) ?? trimmed;
  });
}

export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === true) return true;
    if (value === 'false' || value === '0' || value === false) return false;
    return value;
  });
}

export function ToInt(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return value === null ? null : undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  });
}
