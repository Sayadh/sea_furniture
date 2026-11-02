<template>
  <div class="flex min-h-screen flex-col pb-[64px] md:pb-0">
    <a href="#main" class="sr-only z-50 rounded bg-espresso px-4 py-2 text-linen focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Անցնել բովանդակությանը</a>
    <LayoutAppHeader />
    <main id="main" class="flex-1"><slot /></main>
    <LayoutAppFooter />
    <LayoutMobileContactBar />
  </div>
</template>
