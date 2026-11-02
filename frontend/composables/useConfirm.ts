interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  danger: boolean;
}

let resolver: ((value: boolean) => void) | null = null;

/** Promise-based confirmation dialog: `if (await confirm({...})) { ... }` */
export function useConfirm() {
  const state = useState<ConfirmState>('confirm-dialog', () => ({
    open: false, title: '', message: '', confirmText: 'Հաստատել', danger: false,
  }));

  function confirm(opts: Partial<Omit<ConfirmState, 'open'>> & { message: string }): Promise<boolean> {
    state.value = { title: 'Հաստատեք գործողությունը', confirmText: 'Հաստատել', danger: false, ...opts, open: true };
    return new Promise((resolve) => (resolver = resolve));
  }

  function close(result: boolean) {
    state.value = { ...state.value, open: false };
    resolver?.(result);
    resolver = null;
  }

  return { state, confirm, close };
}
