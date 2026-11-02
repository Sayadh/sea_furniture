import type { Availability, OrderStatus, RequestSource, RequestStatus } from '~/types/api';

/** 420000 → "420 000 ֏" (deterministic on server and client — no Intl/ICU differences, avoids hydration mismatches) */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const digits = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return `${digits}\u00A0֏`;
}

export function formatDate(value: string | Date, withTime = false): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const date = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  if (!withTime) return date;
  return `${date}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** +37477123456 → "+374 77 123 456" */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const m = /^\+374(\d{2})(\d{3})(\d{3})$/.exec(phone);
  return m ? `+374 ${m[1]} ${m[2]} ${m[3]}` : phone;
}

export function telLink(phone: string | null | undefined): string {
  return phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : '#';
}

export function whatsappLink(phone: string | null | undefined, text?: string): string {
  if (!phone) return '#';
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Client-side mirror of the backend Armenian phone rule. */
export function normalizePhone(raw: string): string | null {
  const compact = raw.replace(/[\s\-().]/g, '');
  const m = /^(?:\+374|00374|374|0)(\d{8})$/.exec(compact);
  return m ? `+374${m[1]}` : null;
}

export const availabilityLabel: Record<Availability, string> = {
  IN_STOCK: 'Առկա է',
  MADE_TO_ORDER: 'Պատվերով',
  OUT_OF_STOCK: 'Առկա չէ',
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  NEW: 'Նոր',
  CONFIRMED: 'Հաստատված',
  IN_PROGRESS: 'Ընթացքի մեջ',
  READY: 'Պատրաստ է',
  DELIVERED: 'Առաքված',
  CANCELLED: 'Չեղարկված',
};

export const requestStatusLabel: Record<RequestStatus, string> = {
  NEW: 'Նոր',
  CONTACTED: 'Կապ է հաստատվել',
  IN_PROGRESS: 'Ընթացքի մեջ',
  COMPLETED: 'Ավարտված',
  CANCELLED: 'Չեղարկված',
};

export const requestSourceLabel: Record<RequestSource, string> = {
  REPAIR: 'Վերանորոգում',
  CONTACT: 'Հետադարձ կապ',
  CONSULTATION: 'Խորհրդատվություն',
};

/**
 * Responsive srcset for Unsplash-hosted images (seed data). Other URLs are returned as-is.
 * Uploaded images are already resized to WebP by the API.
 */
export function imageSrcset(url: string | null | undefined, widths = [480, 800, 1200, 1600]): string | undefined {
  if (!url || !url.includes('images.unsplash.com')) return undefined;
  return widths.map((w) => `${url.replace(/([?&])w=\d+/, `$1w=${w}`)} ${w}w`).join(', ');
}

export function imageAt(url: string | null | undefined, width: number): string | undefined {
  if (!url) return undefined;
  return url.includes('images.unsplash.com') ? url.replace(/([?&])w=\d+/, `$1w=${width}`) : url;
}

export function pluralize(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}
