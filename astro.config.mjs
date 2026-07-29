// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import { codeTheme } from './src/styles/code-theme.mjs'

export default defineConfig({
  site: 'https://grahamvanpelt.dev',
  trailingSlash: 'never',
  build: { format: 'file' },
  // Element-first CSS constantly puts a scoped `p` rule against a global `p`
  // rule. 'attribute' compiles the scoped one to `p[data-astro-cid-x]` — (0,1,1)
  // beats (0,0,1). 'where' would leave them tied with bundle order as tiebreak.
  scopedStyleStrategy: 'attribute',
  // Dev is exposed over the tailnet via `tailscale serve --https=4321`, which
  // proxies to IPv4 loopback and forwards the ts.net Host header.
  server: { host: '127.0.0.1', port: 4321 },
  vite: {
    // strictPort: the tailscale proxy targets 4321, so failing loudly beats
    // silently falling back to 4322.
    server: { allowedHosts: ['.ts.net'], strictPort: true },
  },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: codeTheme },
  },
})
