/** Turns user input like "077 12-34-56" into a fragment that matches stored +374XXXXXXXX numbers. */
export function phoneSearchFragment(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length < 4) return null;
  return digits.replace(/^(00374|374|0)/, '');
}
