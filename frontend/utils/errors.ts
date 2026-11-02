import type { ApiErrorBody } from '~/types/api';

export function apiErrorMessage(error: unknown, fallback = 'Տեղի ունեցավ սխալ։ Խնդրում ենք փորձել կրկին'): string {
  const e = error as { data?: Partial<ApiErrorBody>; statusCode?: number; message?: string };
  if (e?.data?.message) return e.data.message;
  if (e?.statusCode === undefined && e?.message?.includes('fetch')) return 'Կապ չկա սերվերի հետ։ Ստուգեք ինտերնետ կապը';
  return fallback;
}

export function apiFieldErrors(error: unknown): Record<string, string> {
  const e = error as { data?: Partial<ApiErrorBody> };
  const out: Record<string, string> = {};
  for (const [field, msgs] of Object.entries(e?.data?.errors ?? {})) out[field] = msgs[0] ?? '';
  return out;
}
