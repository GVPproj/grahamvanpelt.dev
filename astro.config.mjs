// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://grahamvanpelt.dev',
  trailingSlash: 'never',
  build: { format: 'file' },
  // Element-first CSS constantly puts a scoped `p` rule against a global `p`
  // rule. 'attribute' compiles the scoped one to `p[data-astro-cid-x]` — (0,1,1)
  // beats (0,0,1). 'where' would leave them tied with bundle order as tiebreak.
  scopedStyleStrategy: 'attribute',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'rose-pine-moon' },
  },
})
