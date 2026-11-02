import { defineStore } from 'pinia';
import type { Availability, ProductCard } from '~/types/api';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  availability: Availability;
  quantity: number;
}

type AddInput = Pick<ProductCard, 'id' | 'slug' | 'name' | 'price' | 'oldPrice' | 'availability'> & { image?: string | null };

const STORAGE_KEY = 'sf_cart_v1';
const MAX_QTY = 99;

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const hydrated = ref(false);

  const count = computed(() => items.value.reduce((n, i) => n + i.quantity, 0));
  const total = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0));

  function hydrate() {
    if (hydrated.value || !import.meta.client) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
      if (Array.isArray(parsed)) items.value = parsed.filter((i) => i && typeof i.productId === 'string' && i.quantity > 0);
    } catch {
      items.value = [];
    }
    hydrated.value = true;
  }

  function persist() {
    if (!import.meta.client) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
    } catch {
      /* storage unavailable (private mode) — cart still works in memory */
    }
  }

  function add(product: AddInput, quantity = 1) {
    const existing = items.value.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity = Math.min(MAX_QTY, existing.quantity + quantity);
    } else {
      items.value.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image ?? null,
        availability: product.availability,
        quantity: Math.min(MAX_QTY, Math.max(1, quantity)),
      });
    }
    persist();
  }

  function setQuantity(productId: string, quantity: number) {
    const item = items.value.find((i) => i.productId === productId);
    if (!item) return;
    item.quantity = Math.min(MAX_QTY, Math.max(1, Math.floor(quantity) || 1));
    persist();
  }

  function remove(productId: string) {
    items.value = items.value.filter((i) => i.productId !== productId);
    persist();
  }

  function clear() {
    items.value = [];
    persist();
  }

  /** Syncs names/prices/availability with the server; drops products that no longer exist. Returns true if something changed. */
  function sync(fresh: ProductCard[]): boolean {
    const map = new Map(fresh.map((p) => [p.id, p]));
    let changed = false;
    const next: CartItem[] = [];
    for (const item of items.value) {
      const p = map.get(item.productId);
      if (!p) {
        changed = true;
        continue;
      }
      if (p.price !== item.price || p.availability !== item.availability || p.name !== item.name) changed = true;
      next.push({ ...item, name: p.name, slug: p.slug, price: p.price, oldPrice: p.oldPrice, availability: p.availability, image: p.images[0]?.url ?? item.image });
    }
    items.value = next;
    persist();
    return changed;
  }

  return { items, hydrated, count, total, hydrate, add, setQuantity, remove, clear, sync };
});
