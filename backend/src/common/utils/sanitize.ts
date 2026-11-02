/**
 * Plain-text sanitizer: strips HTML tags and control characters.
 * All user content is rendered as text on the frontend (no v-html),
 * so this is defence in depth against stored XSS.
 */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const TAGS = /<\/?[a-z!][^>]*>/gi;

export function sanitizeText(value: string): string {
  return value.replace(TAGS, '').replace(CONTROL_CHARS, '').trim();
}
