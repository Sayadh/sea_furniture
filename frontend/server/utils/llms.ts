import { prettyPhone, type LlmsData } from './seoFeeds';
import { ARMENIAN_CITIES, ARMENIA_MARZER } from '~/utils/seoContent';

/**
 * /llms.txt (https://llmstxt.org) — a Markdown summary of the business for AI assistants
 * (ChatGPT, Claude, Perplexity, Gemini…), generated from the same data the site shows.
 * `full` adds every product (without prices — by decision) and every FAQ answer.
 */
export function buildLlmsTxt(data: LlmsData | null, site: string, full: boolean): string {
  const s = data?.settings;
  const name = s?.siteName || 'Sea Furniture';
  const url = (path: string) => `${site}${path}`;
  const lines: string[] = [];
  const push = (...l: string[]) => lines.push(...l);

  push(
    `# ${name}`,
    '',
    `> ${name} — փափուկ կահույքի արտադրող և վաճառող Երևանում (Հայաստան)․ բազմոցներ, անկյունային բազմոցներ, բազկաթոռներ, աթոռներ, ննջասենյակի և հյուրասենյակի կահույք, պատվերով կահույք և փափուկ կահույքի վերանորոգում։ Առաքում Երևանում և Հայաստանի բոլոր մարզերում։`,
    '>',
    `> English: ${name} is an upholstered furniture workshop and store in Yerevan, Armenia: sofas, corner sofas, armchairs, upholstered chairs, bedroom and living-room furniture, custom-made furniture (any size, shape and fabric) and upholstery / furniture repair. Delivery across Yerevan and all regions of Armenia. Website language: Armenian.`,
    '',
    '## Key facts',
    '',
    `- Location: ${s?.address || 'Yerevan, Armenia'} (own production workshop in Yerevan)`,
    '- Products: ready-made and made-to-order upholstered furniture; fabrics include velvet, bouclé, chenille, eco-leather and genuine leather',
    '- Services: sofa, armchair and chair repair, reupholstery, foam and frame replacement, furniture transport',
    '- Experience: 3 years in upholstery; 1500+ pieces of furniture made or restored',
    '- Warranty: up to 2 years (frame, mechanisms, seams)',
    '- Delivery: Yerevan within 1–3 working days; all regions of Armenia (time and cost agreed when the order is confirmed)',
    '- Payment: on delivery',
    '- Repair estimate: free preliminary price from photos, the same day',
  );
  if (s?.workingHours) push(`- Working hours: ${s.workingHours}`);
  const contacts = [
    s?.phone && `phone ${prettyPhone(s.phone)}`,
    s?.phone2 && `phone ${prettyPhone(s.phone2)}`,
    s?.whatsapp && `WhatsApp ${prettyPhone(s.whatsapp)}`,
  ].filter(Boolean);
  if (contacts.length) push(`- Contacts: ${contacts.join(', ')}`);
  const social = [s?.instagramUrl && `Instagram ${s.instagramUrl}`, s?.tiktokUrl && `TikTok ${s.tiktokUrl}`, s?.facebookUrl && `Facebook ${s.facebookUrl}`].filter(Boolean);
  if (social.length) push(`- Social: ${social.join(', ')}`);
  push(
    `- Service area: ${ARMENIA_MARZER.join(', ')}; cities incl. ${ARMENIAN_CITIES.join(', ')}`,
    '- Typical searches: կահույք Երևանում, փափուկ կահույք, բազմոց, անկյունային բազմոց, պատվերով կահույք, կահույքի վերանորոգում, բազմոցի վերանորոգում, աթոռների վերանորոգում, բազկաթոռի վերանորոգում, վերապաստառում, мебель Ереван, диван Ереван, ремонт мебели Ереван, перетяжка мебели Ереван, furniture Yerevan, sofa Yerevan, upholstery repair Armenia',
    '',
  );

  if (data?.categories.length) {
    push('## Catalog', '', `- [Ամբողջ կատալոգ / Full catalog](${url('/catalog')}): փափուկ կահույք Երևանում`);
    for (const c of data.categories) push(`- [${c.name}](${url(`/catalog/${c.slug}`)})${c.description ? `: ${c.description}` : ''}`);
    push('');
  }

  if (data?.services.length) {
    push('## Furniture repair services', '', `- [Կահույքի վերանորոգում / All repair services](${url('/services')})`);
    for (const sv of data.services) {
      const details = [sv.shortDescription, sv.duration && `ժամկետ՝ ${sv.duration}`].filter(Boolean).join(' — ');
      push(`- [${sv.title}](${url(`/services/${sv.slug}`)})${details ? `: ${details}` : ''}`);
    }
    push('');
  }

  push(
    '## Guides and information',
    '',
    `- [Կահույք ամբողջ Հայաստանում / Delivery across Armenia](${url('/kahuyq-hayastanum')})`,
    `- [Ինչպես ընտրել որակյալ փափուկ կահույք / How to choose quality upholstered furniture](${url('/inchpes-yntrel-papuk-kahuyq')})`,
    `- [Հաճախ տրվող հարցեր / FAQ](${url('/faq')})`,
    `- [Մեր աշխատանքները / Repair portfolio: before and after](${url('/portfolio')})`,
    `- [Մեր մասին / About](${url('/about')})`,
    `- [Կապ / Contact](${url('/contact')})`,
    '',
  );

  if (!full) {
    push('## Optional', '', `- [Full product list and FAQ answers](${url('/llms-full.txt')})`, '');
    return lines.join('\n');
  }

  const availability: Record<string, string> = { IN_STOCK: 'առկա է / in stock', MADE_TO_ORDER: 'պատվերով / made to order', OUT_OF_STOCK: 'առկա չէ / out of stock' };
  if (data?.products.length) {
    push('## Products', '', 'Prices are shown on each product page (they change; always check the page).', '');
    for (const p of data.products) {
      const details = [p.category.name, p.shortDescription, p.material && `նյութ՝ ${p.material}`, availability[p.availability]].filter(Boolean).join(' — ');
      push(`- [${p.name}](${url(`/products/${p.slug}`)}): ${details}`);
    }
    push('');
  }

  if (s?.deliveryInfo) push('## Delivery and payment', '', s.deliveryInfo, '');

  if (data?.faqs.length) {
    push('## FAQ', '');
    for (const f of data.faqs) push(`### ${f.question}`, '', f.answer, '');
  }

  return lines.join('\n');
}
