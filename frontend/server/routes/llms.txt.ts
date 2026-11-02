import { buildLlmsTxt } from '../utils/llms';
import { getLlmsData } from '../utils/seoFeeds';
/** /llms.txt — business summary for AI assistants (see server/utils/llms.ts). */
export default defineCachedEventHandler(
  async (event) => {
    const site = useRuntimeConfig(event).public.siteUrl;
    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
    // Readable by AI crawlers, but kept out of the normal search results list
    setHeader(event, 'X-Robots-Tag', 'noindex');
    return buildLlmsTxt(await getLlmsData(), site, false);
  },
  { name: 'llms-txt', maxAge: 60 * 30 },
);
