// https://nuxt.com/docs/api/configuration/nuxt-config
// Values below are read at BUILD time and baked into the production build,
// so the deployed app needs no .env file.
//   VITE_API_URL          — API origin, e.g. https://api.seafurniture.am (API_PROXY_TARGET is an alias)
//   NUXT_PUBLIC_SITE_URL  — public site URL, e.g. https://seafurniture.am
// Both can still be overridden at runtime with NUXT_API_INTERNAL_BASE / NUXT_PUBLIC_SITE_URL.
const apiTarget = (process.env.VITE_API_URL || process.env.API_PROXY_TARGET || 'http://127.0.0.1:4000').replace(/\/+$/, '');
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  typescript: { strict: true, typeCheck: false },

  runtimeConfig: {
    // Server-side (SSR) requests go straight to the API
    apiInternalBase: `${apiTarget}/api`,
    // /api/** and /uploads/** are proxied to this origin by server/routes (see server/utils/api-proxy.ts)
    apiProxyTarget: apiTarget,
    public: {
      // Browser requests use the same origin; Nuxt proxies /api and /uploads to the API (server/routes)
      apiBase: '/api',
      siteUrl,
      siteName: 'Sea Furniture',
      // Google Search Console "HTML tag" verification code (content="..." value only). Empty → no tag.
      // Can also be set at runtime on the server: NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      googleSiteVerification: process.env.NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'hy' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [
        { name: 'theme-color', content: '#2A1D17' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'apple-mobile-web-app-title', content: 'Sea Furniture' },
      ],
      link: [
        // Icons generated from the brand logo (see public/): browsers, Google Search, iOS, Android/PWA
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/x-icon', sizes: '48x48', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Armenian:wght@400;500;600;700&family=Noto+Serif+Armenian:wdth,wght@87.5,400;87.5,500;87.5,600;100,500&display=swap',
        },
      ],
    },
  },

  routeRules: {
    // Admin panel is a client-rendered SPA (no SEO, auth via httpOnly cookies)
    '/admin/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/cart': { headers: { 'X-Robots-Tag': 'noindex' } },
    '/checkout': { headers: { 'X-Robots-Tag': 'noindex' } },
    '/order-success': { headers: { 'X-Robots-Tag': 'noindex' } },
  },

  nitro: {
    compressPublicAssets: true,
  },

  tailwindcss: {
    cssPath: false,
    viewer: false,
  },
});
