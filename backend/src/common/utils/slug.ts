const ARMENIAN_MAP: Record<string, string> = {
  ա: 'a', բ: 'b', գ: 'g', դ: 'd', ե: 'e', զ: 'z', է: 'e', ը: 'y', թ: 't', ժ: 'zh',
  ի: 'i', լ: 'l', խ: 'kh', ծ: 'ts', կ: 'k', հ: 'h', ձ: 'dz', ղ: 'gh', ճ: 'ch', մ: 'm',
  յ: 'y', ն: 'n', շ: 'sh', ո: 'o', չ: 'ch', պ: 'p', ջ: 'j', ռ: 'r', ս: 's', վ: 'v',
  տ: 't', ր: 'r', ց: 'c', ւ: 'v', փ: 'p', ք: 'q', և: 'ev', օ: 'o', ֆ: 'f',
};

/** Transliterates Armenian (and Latin) text into a URL-safe slug. */
export function slugify(input: string): string {
  const lower = input.toLowerCase().replace(/ու/g, 'u');
  let out = '';
  for (const ch of lower) {
    out += ARMENIAN_MAP[ch] ?? ch;
  }
  return out
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
