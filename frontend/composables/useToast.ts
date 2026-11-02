export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

let nextId = 1;

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => []);

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function push(type: Toast['type'], message: string, timeout = 4500) {
    const id = nextId++;
    toasts.value = [...toasts.value.slice(-3), { id, type, message }];
    if (import.meta.client) setTimeout(() => dismiss(id), timeout);
  }

  return {
    toasts,
    dismiss,
    success: (m: string) => push('success', m),
    error: (m: string) => push('error', m, 6500),
    info: (m: string) => push('info', m),
  };
}
