# State of Astro 7 for a Small Static Personal Site

**Date:** 2026-07-28

**Research question:** What does Astro 7 look like today for a small static personal site (home page, markdown blog, CV pages, portfolio)? Does Astro 7 exist, what changed in Astro 5/6/7 relative to Astro 4-era knowledge, and how do content collections, view transitions, plain CSS, vanilla Motion (motion.dev), and Netlify static deploys work today?

All claims below are sourced from primary sources only: docs.astro.build, astro.build/blog, and motion.dev.

---

## 1. Version status: Astro 7 exists and is the current major

- **Astro 7.0 was released June 22, 2026** ([Astro 7.0 announcement](https://astro.build/blog/astro-7/)). The latest minor is **Astro 7.1, released July 16, 2026** ([Astro 7.1 announcement](https://astro.build/blog/astro-710/)).
- Release cadence of recent majors:
  - **Astro 5.0** — December 3, 2024 ([Astro 5.0 announcement](https://astro.build/blog/astro-5/))
  - **Astro 6.0** — March 10, 2026 ([Astro 6.0 announcement](https://astro.build/blog/astro-6/))
  - **Astro 7.0** — June 22, 2026 ([Astro 7.0 announcement](https://astro.build/blog/astro-7/))

### What changed per major (vs. Astro 4-era knowledge)

**Astro 5** ([blog](https://astro.build/blog/astro-5/)):

- **Content Layer API** replaced "legacy" content collections: a unified, type-safe API to define, load, and access content from any source via **loaders** — built-in `glob()` and `file()` loaders for local files, plus custom loaders for CMSs/APIs. Config moved to **`src/content.config.ts`**, and content can live **anywhere** on disk (no longer required to be in `src/content/`). Astro reported up to 5x faster Markdown builds and 25–50% less memory.
- **Server Islands** became a core primitive: mix cached static HTML with dynamically server-rendered components on the same page (avatars, carts, etc.). Note: server islands require on-demand rendering, i.e. an adapter — irrelevant to a purely static site.
- **`astro:env`** for type-safe environment variables.
- In the Astro 5 era the `<ViewTransitions />` component was **renamed `<ClientRouter />`**; current docs only document `<ClientRouter />` from `astro:transitions` (see §Section on view transitions and the [view transitions guide](https://docs.astro.build/en/guides/view-transitions/)).

**Astro 6** ([blog](https://astro.build/blog/astro-6/)):

- **Node.js 22 minimum** (drops Node 18/20). Vite 7. Shiki 4 for code highlighting. Zod 4, with `z` now imported from **`astro/zod`** rather than `astro:content`.
- Redesigned `astro dev` using Vite's Environment API (dev runs your actual production runtime).
- Built-in **Fonts API** (config-driven font downloading/caching/optimization).
- **Live content collections** stable (request-time content fetching — needs a server, not relevant for static).
- Native **Content Security Policy** support stable.
- Experimental previews of the Rust compiler, queued rendering, and route caching.

**Astro 7** ([blog](https://astro.build/blog/astro-7/), [v7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/)):

- A "speed release": builds 15–61% faster on real projects.
- **Rust `.astro` compiler** is now stable and default (replaces the Go compiler).
- **Sätteri**, a Rust-powered Markdown/MDX pipeline, is now the **default markdown processor**, replacing unified/remark — `@astrojs/markdown-remark` is no longer installed by default ([v7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/)).
- **Vite 8 with Rolldown** (Rust bundler replacing esbuild + Rollup).
- Queued rendering engine stable and default (~2.4x faster rendering).
- New `src/fetch.ts` advanced-routing entrypoint (fetch-handler/Hono-style middleware); `src/fetch.ts` is now a **reserved filename**.
- Stable **route caching** (`Astro.cache`) — server feature, not relevant for static.
- AI/agent DX: `astro dev --background`, JSON logging, health-check endpoint.
- **Removed:** `@astrojs/db`; `astro:transitions` internal `TRANSITION_*` constants.

---

## 2. Markdown + frontmatter blog pipeline today

Per the [content collections guide](https://docs.astro.build/en/guides/content-collections/):

- Define collections in **`src/content.config.ts`** exporting a `collections` object.
- `defineCollection({ loader, schema })`:
  - `glob({ pattern: "**/*.md", base: "./src/content/blog" })` — loader from **`astro/loaders`**; content can live in any directory you point `base` at (`src/content/` remains a fine convention).
  - `file("src/data/things.json")` for many entries in one JSON/YAML/TOML file.
- **Zod schemas** validate frontmatter; import as `import { z } from "astro/zod"` (changed in Astro 6 — previously `astro:content`; [Astro 6.0 blog](https://astro.build/blog/astro-6/)).
- Query with `getCollection('blog')` / `getEntry('blog', id)` from `astro:content`; render the markdown body with **`render(entry)`** (also from `astro:content`), which returns `{ Content }` for use as `<Content />`. The Astro 4-era `entry.render()` method is gone with legacy collections.
- **Frontmatter:** YAML and TOML supported ([markdown guide](https://docs.astro.build/en/guides/markdown-content/)).
- **Default processor is Sätteri** (Rust): included with Astro, no extra install, GitHub-Flavored Markdown + SmartyPants applied by default. Sätteri has its **own plugin model** (`mdastPlugins` / `hastPlugins` options plus a `features` toggle) ([markdown guide](https://docs.astro.build/en/guides/markdown-content/)).
- **remark/rehype plugins still work**, but now require opting back in: install `@astrojs/markdown-remark` and set `markdown.processor: unified()`, then use `remarkPlugins`/`rehypePlugins` as before ([v7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/), [markdown guide](https://docs.astro.build/en/guides/markdown-content/)).
- **Syntax highlighting:** Shiki by default, preconfigured with the `github-dark` theme; configurable via `markdown.shikiConfig.theme`/`themes` (dual light/dark themes supported); Prism available as an alternative ([syntax highlighting guide](https://docs.astro.build/en/guides/syntax-highlighting/)). Shiki 4 as of Astro 6 ([Astro 6.0 blog](https://astro.build/blog/astro-6/)).

**Takeaway for this site:** a plain markdown blog with frontmatter needs zero extra packages. Only if you rely on specific remark/rehype plugins do you add `@astrojs/markdown-remark`.

---

## 3. Islands & view transitions today

### Islands

- Astro remains zero-JS-by-default static HTML with opt-in islands. **Server islands** (Astro 5+) are the notable addition, but they require an adapter/on-demand rendering — a purely static personal site never touches them ([Astro 5.0 blog](https://astro.build/blog/astro-5/)).

### View transitions

Per the [view transitions guide](https://docs.astro.build/en/guides/view-transitions/):

- The Astro 4-era `<ViewTransitions />` component is gone from the docs; the component is **`<ClientRouter />` from `astro:transitions`**. It turns the MPA into a SPA-like experience with client-side routing, state persistence, and fallbacks for browsers without the native View Transition API.
- Alternatively, Astro supports **browser-native cross-document view transitions** for plain MPAs — animations via native browser APIs with minimal JS and **no router component at all**. For a small static site this is the lighter option (Chromium-family browsers animate; others just get normal navigation).
- In Astro 7 the internal `TRANSITION_*` constants were removed — use the lifecycle event names directly ([v7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/)).

---

## 4. Plain CSS (no Tailwind)

Per the [styling guide](https://docs.astro.build/en/guides/styling/) — no deprecations here; this all works exactly as in Astro 4:

- `<style>` in `.astro` components is **scoped by default** (compiled with `data-astro-cid-*` attributes), so low-specificity selectors like `h1 {}` are safe.
- `<style is:global>` opts out; `:global()` mixes global rules into a scoped block.
- **Global stylesheets:** import a local `.css` file in component frontmatter (typically in your layout), or `<link>` to files in `public/` (bypasses bundling/optimization).
- **Style directives:** `class:list` for conditional classes; `define:vars` to pass frontmatter values into CSS as custom properties.
- Sass/Less/Stylus/LightningCSS supported but entirely optional.
- **Tailwind is fully optional** — it's just a Vite plugin (`@tailwindcss/vite`) when wanted; plain CSS is a first-class path.

---

## 5. Vanilla Motion (motion.dev) via `<script>` tags

- **Motion's vanilla API is framework-free**: `npm install motion`, then `import { animate, scroll, inView, stagger, hover } from "motion"`. The mini HTML/SVG `animate()` is ~2.3 kB ([Motion quick start](https://motion.dev/docs/quick-start)).
- **Astro `<script>` tags are processed by default**: bare `<script>` tags in `.astro` files get bundling, TypeScript support, and **direct npm package imports**; they become `type="module"`, are deduplicated per page, and small ones are inlined. `is:inline` opts out of processing ([client-side scripts guide](https://docs.astro.build/en/guides/client-side-scripts/)). So `<script>import { animate, inView } from "motion"; ...</script>` in any `.astro` component Just Works.
- **Interaction with `<ClientRouter />`** ([view transitions guide](https://docs.astro.build/en/guides/view-transitions/)):
  - Bundled module scripts execute **only once** (first load) and are ignored on subsequent client-side navigations — so `animate()` calls targeting elements on a new page won't re-run by default.
  - Fix: wrap animation setup in an `astro:page-load` listener (`document.addEventListener("astro:page-load", () => { ... })`), which fires after every navigation once the page is visible and scripts have run. Inline scripts can instead use `data-astro-rerun` to force re-execution.
  - Full lifecycle event order: `astro:before-preparation` → `astro:after-preparation` → `astro:before-swap` → `astro:after-swap` → `astro:page-load`.
- **If you skip `<ClientRouter />`** (plain MPA, optionally with native cross-document view transitions), none of these caveats apply — every navigation is a full page load and scripts run normally. For a Motion-driven personal site this is the simplest, most robust setup.

---

## 6. Netlify static deploy

Per the [Netlify deploy guide](https://docs.astro.build/en/guides/deploy/netlify/):

- **No adapter needed for a static site.** "Your Astro project is a static site by default. You don't need any extra configuration to deploy a static Astro site to Netlify." The `@astrojs/netlify` adapter is only for **on-demand rendering** (SSR, server islands, actions).
- Build settings: build command `npm run build` (i.e. `astro build`), publish directory **`dist`**. Optional `netlify.toml`:

  ```toml
  [build]
    command = "npm run build"
    publish = "dist"
  ```

- **Node version:** Astro requires **Node v22.12.0 or higher** ([install prerequisites](https://docs.astro.build/en/install-and-setup/); odd-numbered versions like v23 unsupported). On Netlify, set it via `.nvmrc` or a `NODE_VERSION` environment variable if needed (only mandatory on Netlify's legacy build image; current images default to a modern Node) ([Netlify deploy guide](https://docs.astro.build/en/guides/deploy/netlify/)).

---

## 7. Risks / what could make Astro 7 a poor fit

- **Node 22.12+ minimum** (since Astro 6) — verify local and CI Node versions ([Astro 6.0 blog](https://astro.build/blog/astro-6/), [install docs](https://docs.astro.build/en/install-and-setup/)).
- **Stricter Rust compiler:** unclosed non-void tags are now **errors**, and invalid HTML is no longer auto-corrected ([v7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/)). A greenfield site just needs valid HTML; migrated templates may need fixes.
- **Whitespace change:** `compressHTML` now defaults to `'jsx'` — adjacent inline elements on separate lines no longer get a space between them; add `{" "}` where needed or set `compressHTML: true` for v6 behavior ([v7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/)).
- **Markdown pipeline churn:** Sätteri is new (default as of June 2026) and has its own plugin model; the remark/rehype ecosystem requires opting back into `@astrojs/markdown-remark` + `unified()`. For a basic blog (GFM, Shiki) the default is fine; if you depend on many remark/rehype plugins, expect either the opt-back-in step or porting ([v7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/), [markdown guide](https://docs.astro.build/en/guides/markdown-content/)).
- **New-major freshness:** 7.0 is about five weeks old; 7.1 already landed with refinements (finer CSP directives, `paginate()` URL `format`, `deferRender` for large collections) ([Astro 7.1 blog](https://astro.build/blog/astro-710/)). Point releases are active — normal for Astro, but the Rust compiler/Sätteri surface is the newest code in the stack.
- **Cadence risk:** Astro shipped two majors in ~7 months (6.0 in March, 7.0 in June 2026). Majors have historically been low-pain for simple static sites, but expect a yearly-ish upgrade chore.
- **Removed features that don't matter here:** `@astrojs/db` removed; `astro:transitions` internals removed; `src/fetch.ts` filename reserved ([v7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/)).
- **If migrating an Astro 4 project:** the big rewrites are content collections (legacy `src/content/` + `slug`/`entry.render()` → loaders + `src/content.config.ts` + `render(entry)` + `id`), `<ViewTransitions />` → `<ClientRouter />`, and `z` from `astro/zod`.

---

## Verdict / fit assessment

**Astro 7 (7.1 as of 2026-07-28) is an excellent fit for this site** — home page, markdown blog, CV pages, portfolio:

- **Static-first with zero JS by default** — exactly the workload Astro optimizes for, and the v7 release was specifically about making static/markdown-heavy builds faster.
- **Blog pipeline is batteries-included:** `glob()` loader + zod frontmatter schema + `getCollection`/`render()` + GFM + Shiki (`github-dark`) with no extra dependencies.
- **Plain CSS is first-class:** scoped `<style>`, `is:global`, imported global stylesheets, `define:vars` — no Tailwind required, no deprecations.
- **Vanilla Motion integrates cleanly:** `npm install motion`, import `animate`/`scroll`/`inView` in processed `<script>` tags. Recommendation: skip `<ClientRouter />` (use native cross-document view transitions if desired) and the script re-execution caveats vanish entirely; if the client router is used, wrap Motion setup in `astro:page-load`.
- **Netlify deploy is trivial:** no adapter, `npm run build` → `dist`, four-line `netlify.toml`.

**Caveats:** ensure Node ≥ 22.12; write valid HTML (the Rust compiler no longer forgives unclosed tags); mind the new JSX-style whitespace handling; and if you need niche remark/rehype plugins, add `@astrojs/markdown-remark` back explicitly. None of these are disqualifying for a small personal site — there is no reason to reach for an older major.
