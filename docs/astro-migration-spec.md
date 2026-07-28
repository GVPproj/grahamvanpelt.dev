# Migration spec: grahamvanpelt.dev → Astro 7

**Status:** build-ready. Every decision below is settled; nothing is left to the builder's discretion except where explicitly marked *"tune by eye"*.

This spec folds the eleven tickets of [Map: migrate grahamvanpelt.dev off Next.js/PocketBase](https://github.com/GVPproj/grahamvanpelt.dev/issues/6) into one document. Each section links the ticket that owns the decision; open that ticket for the reasoning, which is not repeated here.

---

## 1. Destination and scope

Replace the Next.js 15 / React 19 / Tailwind / PocketBase site with a pure static Astro 7 site on Netlify, porting layout, type, and structure **as-is** into hand-written plain CSS.

**In scope:** stack, hosting, content pipeline, CSS architecture, animation rewrite, semantic HTML sweep, SEO/RSS/sitemap/404 parity, OG image generation, code-block copy.

**Out of scope:**

- Visual redesign — layout, typography, and structure are ported unchanged. The Rosé Pine Moon recolour (§5.2) is a deliberate, scoped exception: six token *values* change, no structure does.
- Replacing the PocketBase admin UI with any authoring tool. Authoring is edit–commit–deploy.
- Refreshing the typewriter word list (§6.3) — follow-on copy work.

---

## 2. Stack and hosting

*Owned by [Choose the stack](https://github.com/GVPproj/grahamvanpelt.dev/issues/7), informed by [Astro 7 research](https://github.com/GVPproj/grahamvanpelt.dev/issues/8) and [Go/Templ/Datastar research](https://github.com/GVPproj/grahamvanpelt.dev/issues/9).*

| | |
|---|---|
| Framework | **Astro 7** (7.1 current), `output: 'static'` |
| Adapter | **None.** A pure static build needs none. |
| Host | **Netlify Free**, `pnpm build` → `dist` |
| Node | **≥ 22.12.0**; Netlify `NODE_VERSION = "22"`, plus `.nvmrc` pinned to a 22.x ≥ 22.12 |
| Package manager | pnpm (unchanged) |
| Animation library | **None** (§6) |
| CSS framework | **None** — hand-written plain CSS (§5) |

The Go/Templ/Datastar path is **closed**. Datastar's server-driven reactivity has no use on this site; revisiting it would be a fresh effort, not a resumption.

### 2.1 Dependencies

**Add (runtime):**

```
astro                    ^7.1
@astrojs/rss             latest
@astrojs/sitemap         latest
```

**Add (devDependencies — build-time only, nothing ships to the browser):**

```
satori                   0.29.0
@resvg/resvg-js          2.6.2
```

**Remove, all of them:**

```
next  react  react-dom  eslint-config-next
tailwindcss  @tailwindcss/typography  postcss  prettier-plugin-tailwindcss
framer-motion  js-confetti  @radix-ui/react-dropdown-menu
markdown-to-jsx  pocketbase
@types/react  @types/react-dom
```

**Scripts:** `dev` → `astro dev`, `build` → `astro build`, `preview` → `astro preview`. Drop `start` and `lint` (or replace `lint` with `astro check`).

Neither satori nor resvg-js declares a peer dependency, so there is zero Astro-version coupling. resvg-js ships prebuilt binaries for `linux-arm64-gnu` (dev machine) and `linux-x64-gnu` (Netlify) — no `node-gyp`, no postinstall.

> **Revisit-first component:** `@resvg/resvg-js@2.6.2` has not moved since March 2024 and its support matrix stops at Node 22. Fine at 22.12; it is the first thing to suspect if the build breaks.

### 2.2 `astro.config.mjs`

```js
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://grahamvanpelt.dev',
  trailingSlash: 'never',
  build: { format: 'file' },
  scopedStyleStrategy: 'attribute',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'rose-pine-moon' },
  },
})
```

Every line is load-bearing:

- **`site`** — required by canonicals, RSS, and the sitemap.
- **`trailingSlash: 'never'` + `build.format: 'file'`** — Astro's default `'directory'` format emits `dist/blog/foo/index.html`, which Netlify serves at the **trailing-slash** URL. That would silently change every URL on the site, including the three blog slugs confirmed stable. `'file'` emits `dist/blog/foo.html`, matching Next's extensionless form.
- **`scopedStyleStrategy: 'attribute'`** — chosen deliberately, not inherited. Element-first CSS (§5.1) constantly puts a scoped `p` rule against a global `p` rule; `attribute` compiles the scoped rule to `p[data-astro-cid-x]`, specificity (0,1,1), so it reliably beats global (0,0,1). `'where'` would leave them tied at (0,0,1) with bundle order as the tiebreak — unacceptable for element-first work.
- **`shikiConfig.theme`** — Shiki is on by default in Astro; `rose-pine-moon` is a bundled theme, so site chrome and code blocks share one palette for free (§5.5).

---

## 3. Content pipeline

*Owned by [Parity & deploy details](https://github.com/GVPproj/grahamvanpelt.dev/issues/14) and [Export PocketBase posts](https://github.com/GVPproj/grahamvanpelt.dev/issues/11).*

PocketBase is retired. The blog is markdown files in the repo, read by an Astro content collection.

### 3.1 The exported content

Already done, committed on `content/pocketbase-export` at `src/content/blog/`:

| File | Title | Created |
|---|---|---|
| `first-go-app.md` | Greetings in the Terminal with Go | 2025-08-20 |
| `migrating-remix-loader-data-to-nextjs-server-component.md` | Migrating Remix loader data to a NextJs server component | 2024-12-03 |
| `deploy-pocketbase-to-fly.md` | Deploying a containerized PocketBase instance to Fly.io | 2024-11-02 |

Facts that matter downstream:

- **No images or attachments** in any post — nothing to migrate alongside the text.
- **All three slugs are unchanged**, so the blog needs **no redirects**.
- 28 code fences across the posts, all of which render highlighted for the first time under Shiki.
- `src/content/blog/test-post.md` is **not** an export — it is a hand-written typography fixture (§10, step 5). It is deleted before launch.

### 3.2 Collection definition

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'          // relocated in Astro 6

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),           // NEW — required
    created: z.coerce.date(),
  }),
})

export const collections = { blog }
```

Three changes from the exported frontmatter:

1. **`slug` is dropped.** Astro derives `entry.id` from the filename, so the field was a second name for the same thing — and had already drifted (`test-post.md` carried a mismatched `slug`). `[...slug].astro` uses `entry.id` directly. One source of truth.
2. **`description` is required, not optional.** It feeds the meta description, the OG card, and the RSS item. Optional means a post ships with all three degraded and the build stays green; required means the build fails until it's written. **Three descriptions must be authored during execution** — the only new post copy this migration needs.
3. **No `draft` flag**, because `test-post.md` is deleted rather than excluded. This removes the four places a forgotten filter would leak it: the blog listing, RSS, the sitemap, and OG generation.

`created` is already normalised to `T`-separated ISO 8601 UTC, so `z.coerce.date()` parses it cleanly.

### 3.3 Routes

| Route | Source |
|---|---|
| `/` | `src/pages/index.astro` |
| `/blog` | `src/pages/blog.astro` — `getCollection('blog')`, sorted `created` desc |
| `/blog/[slug]` | `src/pages/blog/[...slug].astro` — `getStaticPaths` over the collection, `render(entry)` |
| `/cv` | `src/pages/cv.astro` — **flat page**, no layout-plus-children (§6.4) |
| `/portfolio` | `src/pages/portfolio.astro` |
| `/404` | `src/pages/404.astro` |
| `/rss.xml` | `src/pages/rss.xml.ts` (§8.2) |
| `/og/[slug].png` | `src/pages/og/[...slug].png.ts` (§7) |

The old listing filtered `created >= 2022-01-01` and paginated at 50. With three posts both are moot; **the Astro list page needs neither.**

---

## 4. Removals

*Owned by [Animation inventory](https://github.com/GVPproj/grahamvanpelt.dev/issues/10).*

`/cv/education` is **removed entirely** — the page, `CvNav`, `Certificate`, the `js-confetti` dependency, and `public/images/scrim-cert.webp`. With Tipbox and Mythical on the CV, a bootcamp certificate is the weakest item on the page, and giving it a nav tab inverts the signal.

**Kept:** a one-line *"Scrimba Frontend Career Path, 2022–23"* under Qualifications, so the site isn't silent on formal training without spending a page on it.

Because two CV tabs become one, `CvNav` would point at the page you're already on. `/cv` becomes a single flat page.

`/cv/education` is a live URL linked from already-sent job applications, so it gets a redirect (§8.1).

**Files deleted with the React tree:** all of `src/app/`, including `ClickPre.tsx`, `Delay.tsx`, `markdown-to-jsx` usage, `pocketbaseUtils.ts`, and the whole `components/animations/` directory. `portfolioData.ts` and `types/types.ts` port across as plain TS. The icon components port to `.astro` (or inline SVG).

**Dead files removed on the way past:** `src/app/fonts/GeistVF.woff`, `GeistMonoVF.woff` (import already commented out), `sfizia-regularitalic-webfont.*` (superseded by the `no.2` cut), Wotfard `thin`/`extralight` weights (declared, never used), `public/next.svg`, and the unused `.typeme` / `@keyframes type-and-delete` block in `globals.css` (dead — `SpanCycle` never used it).

---

## 5. CSS architecture

*Owned by [CSS architecture for the plain-CSS port](https://github.com/GVPproj/grahamvanpelt.dev/issues/12).*

### 5.1 Shape and selectors

`src/styles/global.css`, imported once in `Layout.astro` — Astro bundles and hashes it, so no manual `<link>`. It holds: reset, tokens, element defaults, `.wrapper` / `.full-bleed`, `.prose`, `.visually-hidden`, and the reduced-motion backstop. The ~60 lines of `@font-face` split into `src/styles/fonts.css`, `@import`-ed at the top, keeping the file you actually reason about at ~140 lines.

Everything component-specific lives in that component's Astro scoped `<style>`.

**Target HTML tags by default.** Astro's scoping makes element selectors genuinely local, and the markup is semantic enough to earn it — the CV sidebar's five identical contact rows collapse to one `aside li a` rule instead of five classed elements.

Reach for a class in exactly three cases:

1. Two same-tag siblings needing different rules (the home page's hero and intro `<section>`s). **Not `:nth-of-type`** — it silently rebinds when markup is reordered.
2. A global primitive: `.wrapper`, `.full-bleed`, `.prose`, `.visually-hidden`, `.code-block`, `.copy-code`.
3. A state or variant toggle.

Names are short and unprefixed inside scoped blocks; the scope is the namespace.

**Reset:** ~15 lines hand-written inline — `border-box`, margin zeroing, heading normalisation, list unstyling, block media, form font inheritance. No dependency; that is what Preflight was doing here.

**Utilities:** none. Each recurrence of `flex` / `items-center` / `gap-*` becomes properties on a named class in the owning component. `.visually-hidden` is the single sanctioned exception — an accessibility primitive, not a layout shortcut.

### 5.2 Tokens — two-tier, Rosé Pine Moon

Twelve canonical roles verbatim from [rose-pine/palette](https://github.com/rose-pine/palette), then six semantic aliases:

```css
:root {
  --rp-base:    #232136;  --rp-love: #eb6f92;
  --rp-surface: #2a273f;  --rp-gold: #f6c177;
  --rp-overlay: #393552;  --rp-rose: #ea9a97;
  --rp-muted:   #6e6a86;  --rp-pine: #3e8fb0;
  --rp-subtle:  #908caa;  --rp-foam: #9ccfd8;
  --rp-text:    #e0def4;  --rp-iris: #c4a7e7;
}
:root {
  --colour-fill:       var(--rp-base);
  --colour-fill-muted: var(--rp-surface);
  --colour-text-base:  var(--rp-text);
  --colour-text-muted: var(--rp-subtle);
  --colour-accent:     var(--rp-iris);
  --colour-highlight:  var(--rp-rose);
}
```

The raw tier is upstream data, not invented values — diffable against the official palette, and `overlay` / `gold` / `foam` are available without pasting stray hexes. **These six `--colour-*` names are the only ones that exist**; nothing outside this block may invent another.

Accent `iris` → hover `rose`. Rosé Pine ships no tint/shade pairs, so hover is a hue shift rather than today's intensity shift — that is Rosé Pine's own idiom.

Measured contrast against the fill:

| | today | Moon | |
|---|---|---|---|
| body text | `#f4f4f5` 12.7:1 | `text` 11.9:1 | fine |
| accent link | `#e879f9` 5.7:1 | `iris` 7.5:1 | **improves** |
| hover | `#d946ef` 4.0:1 | `rose` 7.1:1 | **improves** |
| muted text | `#e4e4e7` 11.0:1 | `subtle` 4.9:1 | passes AA |

`--colour-text-muted` is not actually muted today: `#e4e4e7` against `#f4f4f5` is a 1.15:1 difference, essentially invisible. `subtle` is genuinely dimmer, so muted text starts reading as muted.

> **Do not** use `--rp-muted` `#6e6a86` for text — 3.03:1, fails AA. It is a border/decoration colour only.

The `radial-gradient` dot pattern remaps to `--rp-subtle` at low alpha over base.

### 5.3 Scale — literal rem values, no tokens

Seven font sizes and six gaps across the entire site. An indirection layer would just be a hand-rolled Tailwind, so values are written literally at each call site.

**Tailwind → rem conversion table.** Line-heights are the ones Tailwind was pairing with each size, and must be ported too — they are not the browser default.

| Tailwind class | uses | `font-size` | `line-height` |
|---|---|---|---|
| `text-xs` | 1 | `0.75rem` | `1rem` |
| `text-sm` | 1 | `0.875rem` | `1.25rem` |
| `text-base` | 7 | `1rem` | `1.5rem` |
| `text-lg` | 4 | `1.125rem` | `1.75rem` |
| `text-xl` | 11 | `1.25rem` | `1.75rem` |
| `text-2xl` | 5 | `1.5rem` | `2rem` |
| `text-4xl` | 3 | `2.25rem` | `2.5rem` |
| `text-5xl` | 1 | `3rem` | `1` (unitless) |

| Tailwind class | uses | value |
|---|---|---|
| `gap-2` | 5 | `0.5rem` |
| `gap-4` | 11 | `1rem` |
| `gap-6` | 1 | `1.5rem` |
| `gap-8` | 6 | `2rem` |
| `gap-12` | 5 | `3rem` |
| `gap-16` | 2 | `4rem` |

> `text-5xl`'s line-height is unitless `1`, not `3rem`-derived — Tailwind switches to a tight ratio at `5xl` and above. Porting it as `2.5rem` (extrapolating the pattern from `4xl`) is the easy mistake here.

`font-extrabold` appears twice with no `800` face declared — it has been synthesising from `700` all along. Port as `font-weight: 700`.

### 5.4 Breakpoints

`@container` for exactly **two** genuinely component-local layouts. Each needs a wrapper declaring `container-type: inline-size` — an element cannot query itself.

- **PortfolioItem** — the screenshot/text switch (was `xl:flex-row`) and the tooling row (was `sm:flex-row`)
- **CV** — the sidebar/content two-column split (was `lg:flex-row`)

Both get **re-tuned by eye** against container width rather than ported numerically; a container query's threshold is not the viewport threshold it replaces.

Everything else — nav swap, hero type scale, page rhythm, prose measure — stays `@media` at Tailwind's exact rem values, written as modern range queries:

```
40rem = sm(640)   48rem = md(768)   64rem = lg(1024)   80rem = xl(1280)
```

### 5.5 Prose and code blocks

`.prose` is hand-written in **global**, not scoped: Astro's scoped styles never reach markdown HTML rendered by `<Content />`, because those elements get no scope attribute.

It applies to the **blog post body only.** Today `article, aside { @apply prose … }` gives every `<article>` prose, CV pages included; the CV gets its own explicit rules instead of inheriting by accident.

This fixes a latent bug: `dark:prose-invert` is gated on `prefers-color-scheme: dark` (Tailwind's default `darkMode: 'media'`), so on a light-preference OS the blog body currently renders zinc-700 dark grey on the dark fill. The hand-written layer has one set of values.

**Code blocks:** Shiki does the highlighting with `rose-pine-moon`. `.prose` owns only the surface — padding, radius, `overflow-x: auto`, inline-code chrome.

> **Cross-ticket gotcha.** §9 wraps every `<pre>` in a `.code-block` div at runtime, so the shape becomes `.prose > .code-block > pre`. **Any code-block rule written as a direct-child selector breaks.** `.prose` must style `pre` as a *descendant*.

### 5.6 Fonts

`font-display: swap` on all 8 faces. `<link rel="preload">` for exactly two: **Sfizia 400** and **Wotfard 400**.

Weights actually in use: Wotfard 300/400/500/600/700, Sfizia 400 / 400-italic / 700. Declare those eight, no more.

Three bugs fixed in passing:

1. Sfizia lists `woff` **before** `woff2` in `src:`, so every visitor downloads the larger file and the woff2s are never touched. **Reorder.**
2. No `font-display` anywhere — all faces are FOIT, invisible text for up to 3s cold.
3. Dead files removed (see §4).

### 5.7 Semantic HTML sweep

Folded in here because element-first CSS is only as good as the markup it targets, and the sweep is invisible to sighted users.

**Structure**

- **No page has an `<h1>` today** — the CV even starts at `<h3>`. Home's hero `<p class="text-4xl">` promotes to a visible `<h1>`. Blog, Portfolio, and CV get a `.visually-hidden` `<h1>` with their headings rebased beneath it: correct outline for assistive tech and search, zero pixels changed.
- **Blog index** — a `<section>` of bare links becomes `<ul>` / `<li>`; the post date is currently a second `<h2>` inside the link and becomes `<time datetime>`.
- **Blog post** — the date `<h2>` under the title becomes `<time>`.
- **CV sidebar** — five contact links as `<a><div class="flex">` become `<ul>` / `<li>` / `<a>`.
- **PortfolioItem** — `<div id="ToolingList">` wrapping repeated icon+label divs becomes `<ul>`.
- **Portfolio page** — `<article>` is currently used for "My Role" prose blocks. An `<article>` is meant to be independently distributable, so the *portfolio item* is the article and those blocks are `<section>`s.
- **Footer** — the `<span>` around "grahamvanpelt.dev" exists only to catch the global `span { italic }` rule; it becomes plain text.

**Two correctness bugs fixed**

- `id="ToolingList"` lives inside `PortfolioItem`, which renders once per project — the page emits **duplicate `id`s**. Invalid HTML today.
- `aria-label="Go to my CV."` on a link reading "CV" *replaces* the visible text for screen readers, swapping a clean accessible name for a chatty one and breaking voice-control users who say "click CV". Redundant on all four nav links; genuinely needed only on the icon-only ones (Sig home link, GitHub glyph).

**Element-layer change:** `span { @apply italic }` is **deleted**. It is why `not-italic` is the second-most-used class on the site (22 uses) — an opt-out where an opt-in belongs. The ~5 spans that genuinely want italic use `<em>` or an explicit class. Rendered output is identical.

---

## 6. Animation

*Owned by [Animation inventory](https://github.com/GVPproj/grahamvanpelt.dev/issues/10).*

**No animation library ships.** Not framer-motion, not vanilla Motion. Everything is CSS except one ~25-line script.

| Animation | Verdict | Detail |
|---|---|---|
| **Sig** (signature line-draw) | **Pure CSS** | `pathLength="1"` on the `<path>` + `stroke-dasharray: 1` / `stroke-dashoffset: 1 → 0` keyframes. Keep 2s, `ease-out` to match framer's default tween. |
| **Face** (portrait line-draw) | **Pure CSS** | Same technique. Keep 4s, `ease-out`. |
| **FadeIn** (mount fade) | **Cut** | Its real job was masking the hydration seam; static Astro has no seam. Removing it stops delaying first paint on the portfolio and CV pages. |
| **FadeUp** (scroll reveal, 7 uses) | **Cut** | Takes the `IntersectionObserver` with it. No scroll-triggered motion anywhere in the new site. |
| **SpanCycle** (typewriter) | **Vanilla JS, ~25 lines** | See §6.3. |
| **Certificate** (click → confetti) | **Cut** | Its only host page is removed (§4). |
| **Nav dropdown** | **Native Popover API + CSS** | See §6.2. |
| **Nav item colour flash** | **Cut** | Ran 0.1s flash + 0.3s return + 0.4s sleep before navigating — ~0.8s of dead time per tap, the one animation that made the UI feel *slower*. `:active` gives instant press feedback free, and retires the `prefers-reduced-motion` branch it needed. |
| **Certificate press** (`active:scale-95`) | **Cut with the page** | Would have been a one-line CSS `:active` rule. |

Each `@keyframes` and its rule are colocated in the owning component's scoped `<style>` — Astro scopes keyframe names too. One global `prefers-reduced-motion` backstop sits in `global.css` on top of the per-animation handling.

### 6.1 Background-tab tradeoff, accepted

CSS animations advance on the wall clock; framer-motion's rAF loop throttles in hidden tabs. A visitor who opens the site in a background tab and returns after ~5s finds the line-draws already finished. **Accepted** — no `visibilitychange` guard, no `IntersectionObserver` gate. Decorative motion isn't worth code every other visitor loads.

### 6.2 Nav dropdown — native Popover

`popovertarget` on the trigger, `popover` on the panel: light-dismiss, Escape, top-layer, and ARIA wiring, all with zero JS, Baseline since 2024. Fade in via `@starting-style` + `transition-behavior: allow-discrete`.

This retires `@radix-ui/react-dropdown-menu` and makes the menu work **before JS loads**, which it currently does not.

**Accepted tradeoff:** no focus trap. Acceptable for a full-screen panel of four links.

### 6.3 SpanCycle — vanilla JS

Not honestly CSS-able (it needs a monospace face plus per-word `steps()` keyframes) and not a Motion job either (it mutates `textContent`; it doesn't tween a value). Port the existing timer logic minus React state: **100ms per character typing, 2000ms hold, 50ms per character backspacing**, then advance and wrap. Caret blink becomes a CSS `@keyframes`.

Under `prefers-reduced-motion`, render **a single static word** — this is the only never-ending animation on the site, and a perpetual one is exactly what that query is for.

The word list is left stale for now (it advertises React and Tailwind, both of which are leaving). Refreshing it is follow-on copy work, out of scope here.

---

## 7. OG images

*Owned by [Research: build-time OG image generation](https://github.com/GVPproj/grahamvanpelt.dev/issues/16), amended by [the Wotfard licence check](https://github.com/GVPproj/grahamvanpelt.dev/issues/17).*

Blog posts get a per-post card rendered at build time from the post title, on a Rosé Pine Moon `base` background. Every non-post page shares one hand-made `public/og-default.png`. Both **1200×630**.

**Mechanism:** hand-rolled `satori` + `@resvg/resvg-js` at `src/pages/og/[...slug].png.ts`. `getStaticPaths()` maps `await getCollection('blog')` to `{ params: { slug: post.id }, props: { post } }`; `GET` returns `new Response(png, { headers: { 'Content-Type': 'image/png' } })`.

Confirmed against the Astro endpoints guide: the extension-stripping filename convention holds under `output: 'static'`, `getStaticPaths` is still the dynamic-endpoint mechanism, and a plain `Response` with a Buffer body is the documented binary return. **The v7 upgrade guide documents no breaking changes** to endpoints, `getStaticPaths`, or `Response` handling.

> Any snippet passing `{ encoding: 'binary' }` is pre-v3 and stale. Ignore it.

**Implementation notes:**

- Prefer satori's **object-literal form** (`{ type, props }`) over `satori/jsx`, which is still labelled experimental. No `react` / `react-dom` needed.
- **Read the font buffers once at module scope** — satori's README flags this as a 2× difference.
- Leave `embedFont: true` (the default): it outlines text to `<path>`, so resvg never resolves a font itself, which removes the "wrong glyphs on CI" failure mode.

**Fonts.** Satori supports TTF, OTF, and WOFF — **not WOFF2**, a settled 2022 decision, unchanged through 0.29.0. Fonts are also mandatory; satori has no system-font fallback.

Copy `wotfard-regular-webfont.ttf` and `wotfard-semibold-webfont.ttf` **straight from the kit** (`Wotfard_Webfont_Complete/Wotfard Roman Webfont/`) into `src/assets/og/` — outside `public/`, so Astro never serves them and visitors continue to receive only `.woff2`.

> **No conversion step.** An earlier plan called for converting `.woff2` → `.ttf` with `fonttools`. That premise was wrong: the atipo® webfont kit **ships `.ttf`** alongside `woff2`/`woff`/`eot`, and the licence names all four as provided formats — only the `.woff2`s were ever committed here. So: no Python dependency, no conversion script, no regeneration step, no lossy-conversion risk. The licence permits build-time use by the one licensed website, so **OG cards are on-brand and no fallback typeface is needed.**

**`BaseHead`** points `og:image` at `/og/{entry.id}.png` for posts and `/og-default.png` everywhere else.

**Fallback, if satori ever fails:** `astro-og-canvas` (`0.13.0`, declares `astro: "^7.0.0"`). It was not rejected on maintenance grounds — it loses on *fit*: `OGImageRoute()` returns `getStaticPaths` and `GET` for you and expects a `pages` object, inverting the route shape above; it renders a fixed title/description/logo layout; it pulls multi-MB `canvaskit-wasm` at runtime; and its open issue #68 (multi-weight fonts in one family) bites a card wanting regular + semibold Wotfard.

**Build cost:** no first-party benchmark exists for this workload. Reasoned estimate, explicitly not data: **~100–250 ms per card, under 5 s total** for three posts including cold native-binding load. Measure once it exists.

---

## 8. Parity checklist

*Owned by [Parity & deploy details](https://github.com/GVPproj/grahamvanpelt.dev/issues/14).*

Parity turned out to be a low bar: the Next site sets meta on exactly two pages, has no redirects, no RSS, no sitemap, and ships Next's default 404. Most of this section **closes a gap** rather than porting behaviour.

### 8.1 Redirects — one, and only one

| From | To | Status |
|---|---|---|
| `/cv/education` | `/cv` | **301** |

In `netlify.toml`, not `_redirects`: there is a single rule, the file already exists and must be rewritten anyway for the build settings, and keeping deploy config in one place beats introducing a second convention for one line.

`301`, not `302` — the page is gone for good, and a permanent redirect lets search engines consolidate rather than keep the dead URL indexed. **No `force = true`**: Netlify only needs `force` when a real file sits at the path, and nothing will be built at `/cv/education`.

**The blog needs no redirects** — all three slugs are unchanged, and §2.2 preserves the extensionless URL form.

> **Verify once at first deploy:** Netlify's "Pretty URLs" post-processing setting also normalises trailing slashes. The two should agree; if a `/blog/foo/` request 301s somewhere unexpected, that setting is the cause.

### 8.2 SEO / meta — one component, every page

Today the root layout sets a title and description, `/portfolio` overrides them, and **nothing else sets anything** — every blog post currently shares the title "Graham Van Pelt - Software Developer" in search results and link previews.

A single `src/components/BaseHead.astro`, used by **every** page, taking `title`, `description`, `image`, and optional `article` props, emitting:

- `<title>` and `<meta name="description">`
- `<link rel="canonical">` — absolute, from `new URL(Astro.url.pathname, Astro.site)`
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`
- `twitter:card` = `summary_large_image`, plus title/description/image. **No `twitter:site`** — there is no handle to point at.
- `<link rel="alternate" type="application/rss+xml">`

| Page | Title | OG image | Notes |
|---|---|---|---|
| `/` | `Graham Van Pelt - Software Developer` | default | strings ported verbatim |
| `/blog` | `Blog - Graham Van Pelt` | default | description is new copy |
| `/blog/[slug]` | `{title} - Graham Van Pelt` | **generated** | `og:type: article` + `article:published_time` from `created` |
| `/cv` | `CV - Graham Van Pelt` | default | description is new copy |
| `/portfolio` | `Graham Van Pelt - Portfolio` | default | see copy fix below |
| `/404` | `Not Found - Graham Van Pelt` | default | plus `<meta name="robots" content="noindex">` |

> **Copy fix on the way past.** The existing `/portfolio` description reads *"A list of my web personal with links and descriptions."* — "web personal" is a broken phrase that has been live in the OG tags. **Rewrite it rather than port the typo.** This is the one string not ported verbatim.

### 8.3 RSS

`@astrojs/rss`, one endpoint at `src/pages/rss.xml.ts` driven by `getCollection('blog')`, sorted by `created` descending. `title` and `pubDate` from frontmatter, `description` from the field §3.2 adds, `link` from `entry.id` via `site`.

Hand-rolling was rejected: the package exists because XML escaping and the RSS 2.0 shape are exactly the details that bite, and it's maintained by Astro core.

**Autodiscovery matters as much as the feed** — `<link rel="alternate" type="application/rss+xml" title="Graham Van Pelt" href="/rss.xml">` goes in `BaseHead` so it is on every page, plus a visible link on `/blog`. A feed nobody can find is not a feed.

Publishing rate is roughly one post a year, which is the honest argument against bothering. Taken anyway: ~20 lines, reusing the `description` field the meta work already requires.

### 8.4 Sitemap and robots

`@astrojs/sitemap`, one line in `astro.config.mjs`, generating `sitemap-index.xml` at build. **No `filter` needed** — deleting `test-post.md` means nothing on the site should be excluded except `/404`, which the integration already excludes.

New `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://grahamvanpelt.dev/sitemap-index.xml
```

At ~7 URLs a crawler would find everything from the nav regardless. Taken because `site` is already set for RSS and canonicals, making this the cheapest item on the list.

### 8.5 404

`src/pages/404.astro`, using the **same layout, header, and footer** as every other page: a short line of copy and links to `/` and `/blog`. Netlify serves `dist/404.html` for unmatched paths on a static site automatically — no `[[redirects]]` rule, no config.

Chrome-less was rejected: a bare page reads as *broken infrastructure* rather than *your site, wrong URL*, and bouncing is the exact failure a 404 exists to prevent. That matters more now that a real URL has been retired.

Carries `<meta name="robots" content="noindex">`.

### 8.6 `netlify.toml`

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from = "/cv/education"
  to = "/cv"
  status = 301

[dev]
  command = "pnpm dev"
  framework = "astro"
```

`publish` moves from `.next` to `dist`; `[dev] framework` from `next` to `astro`. `NODE_VERSION = "22"` resolves to the latest 22.x, satisfying Astro 7's `>= 22.12.0` floor without pinning a patch that goes stale. Bump to `"24"` only if a dependency later demands it — and note §2.1's caveat about resvg-js on Node 24+.

---

## 9. Code-block copy-to-clipboard

*Owned by [Code-block copy-to-clipboard](https://github.com/GVPproj/grahamvanpelt.dev/issues/15).*

Copy survives as a client `<script>` in the blog post layout that injects a real `<button>` **beside** each Shiki `<pre>`. No rehype plugin, no new dependency, no build-time markup ownership. `alert()` is gone; confirmation is an in-button label swap.

```astro
<!-- src/layouts/BlogPost.astro -->
<script>
  if (navigator.clipboard) {
    for (const pre of document.querySelectorAll('pre.astro-code')) {
      const wrapper = document.createElement('div')
      wrapper.className = 'code-block'
      pre.parentNode.insertBefore(wrapper, pre)
      wrapper.append(pre)

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'copy-code'
      button.textContent = 'Copy'
      wrapper.append(button)

      let timer
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pre.querySelector('code').textContent)
          button.textContent = 'Copied'
          button.dataset.copied = ''
          clearTimeout(timer)
          timer = setTimeout(() => {
            button.textContent = 'Copy'
            delete button.dataset.copied
          }, 2000)
        } catch {
          button.textContent = 'Press ⌘C'
        }
      })
    }
  }
</script>
```

Six deliberate decisions inside that:

1. **Sibling, not wrapper.** Today's `<button><pre>…</pre></button>` is invalid-ish and hostile — the whole block is one enormous control, and selecting text with the mouse fires a copy. The button becomes a sibling; the `<pre>` is text again.
2. **The `.code-block` wrapper is required, not cosmetic.** `.prose pre` has `overflow-x: auto`, so a button positioned inside the `<pre>` would scroll out of view on long lines. The wrapper is the positioning context and stays put.
3. **Injected, not server-rendered.** The button exists only if the script ran, so there is never a dead control for no-JS visitors. The `navigator.clipboard` guard covers insecure contexts (plain-HTTP dev over LAN) the same way.
4. **`code.textContent`, not `innerText`.** Shiki emits one `<span class="line">` per line with real `\n` between them, so `textContent` reproduces the source exactly. `innerText` is layout-aware and would be at the mercy of the CSS.
5. **Label swap, not `alert()`.** `Copy` → `Copied` for 2s, with a `data-copied` hook for styling. `aria-live` is deliberately **not** set: the button is the focused element when it changes, so screen readers announce the new label already, and a live region would double-announce.
6. **Always visible.** No opacity-on-hover reveal — that hides the affordance on touch, which is exactly where clipboard access is most tedious.

Styling, in the global layer alongside `.prose`:

```css
.code-block {
  position: relative;
}

.copy-code {
  position: absolute;
  inset-block-start: 0.5rem;
  inset-inline-end: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: var(--colour-fill-muted);
  color: var(--colour-text-muted);
  font-size: 0.75rem;
}

.copy-code:hover,
.copy-code[data-copied] {
  color: var(--colour-text-base);
}
```

> **Reconciled during assembly.** Ticket 15 drafted these rules against `--colour-surface`, `--colour-muted`, and `--colour-text`, none of which exist. §5.2 is the authority on token names; the block above uses the real ones (`--colour-fill-muted`, `--colour-text-muted`, `--colour-text-base`).

Both classes are justified under §5.1's rule — they name global primitives that live outside any single component, because the markup is generated and there is no scoped `<style>` to hang them on.

Applies to all 28 fences; nothing per-post to author.

> **Watch item.** The script binds on load, not on `astro:page-load`. **If `<ClientRouter />` is ever added to this site, the selector loop must move into an `astro:page-load` listener** or copy buttons stop appearing after the first client-side navigation. (The Astro 7 research recommends no router for a static site, so this should not arise.)

---

## 10. Execution order

**Branching:** merge `content/pocketbase-export` into `main` first — the `.md` files are stack-agnostic and sit harmlessly alongside the Next app, so the content lands as a clean, separately-revertable commit and `main` is never broken. Then cut **`migrate/astro`** off `main` for the rewrite, which merges once when green.

Also merge `docs/research/astro-7-state.md` and `docs/research/astro-7-og-images.md` from the `research/*` branches into `migrate/astro`, so this spec's citations resolve permanently and those throwaway branches can be deleted.

The rewrite replaces the whole of `src/`, so it cannot land incrementally. The order below is chosen so each step is verifiable before the next depends on it.

| # | Step | Done when |
|---|---|---|
| 1 | Merge `content/pocketbase-export` → `main`. Cut `migrate/astro`. Merge the two research docs in. | `main` clean, branch cut |
| 2 | Scaffold Astro: install deps (§2.1), write `astro.config.mjs` (§2.2), `.nvmrc`, `tsconfig`. Delete `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`. | `astro dev` boots |
| 3 | Content layer: `src/content.config.ts` (§3.2), drop `slug` from the three files, **author the three `description`s**. | `getCollection('blog')` returns 3 typed entries |
| 4 | CSS foundation: `src/styles/fonts.css` (§5.6) and the token/reset/primitive half of `global.css` (§5.1–5.2). Move fonts out of `src/app/`. | tokens resolve, fonts load with `swap` |
| 5 | Blog route + `.prose` (§5.5), with `test-post.md` as the live fixture. **Use descendant `pre` selectors** (§5.5 gotcha). | all element types styled; 28 fences highlighted |
| 6 | Copy-to-clipboard script + `.code-block` / `.copy-code` (§9). | button appears beside every `pre`, copies exact source |
| 7 | **Delete `test-post.md`.** | build green with 3 posts |
| 8 | Layout, header, footer. Nav dropdown → Popover (§6.2). Semantic sweep on shared chrome (§5.7). | menu works with JS disabled |
| 9 | Port pages: `/`, `/portfolio`, `/cv`. Apply §5.3 conversion table, §5.4 container queries (tune by eye), §5.7 sweep. Remove `/cv/education`, `CvNav`, `Certificate`, `scrim-cert.webp`; add the Scrimba one-liner (§4). | pages match old screenshots modulo palette |
| 10 | Animations: Sig + Face CSS line-draws, SpanCycle script, reduced-motion backstop (§6). | motion matches, `prefers-reduced-motion` honoured |
| 11 | `BaseHead.astro` (§8.2) wired into every page, including the `/portfolio` copy fix. | every page has a unique title + canonical |
| 12 | OG images: copy the two `.ttf`s from the kit, build `src/pages/og/[...slug].png.ts`, hand-make `og-default.png` (§7). | 3 cards + default render at 1200×630 |
| 13 | RSS, sitemap, `robots.txt`, `404.astro` (§8.3–8.5). | feed validates, sitemap lists ~7 URLs |
| 14 | Rewrite `netlify.toml` (§8.6). Purge dead files and deps (§2.1, §4). | `pnpm build` green, no stray deps |
| 15 | Deploy preview. Verify the `/cv/education` 301 and the Pretty-URLs interaction (§8.1). Check all three blog URLs are byte-identical to production. | preview passes |
| 16 | Merge `migrate/astro` → `main`. Delete the `research/*` branches. | live |

### Copy to author during execution

The only new writing this migration requires:

- **3 blog post descriptions** (one per real post) — required by the schema; the build fails without them.
- **`/blog` description** and **`/cv` description** — new, no current equivalent.
- **`/portfolio` description** — rewritten, not ported (§8.2).
- **404 page copy** — one short line.

### Verification before merge

- All three blog URLs resolve extensionless with no trailing slash.
- `/cv/education` 301s to `/cv`.
- Every page has a unique `<title>`, `<meta name="description">`, and absolute canonical.
- OG cards render for all three posts; non-post pages fall back to `/og-default.png`.
- `rss.xml` validates; autodiscovery link present on every page.
- No `--colour-*` token outside the six in §5.2.
- Copy buttons appear on all 28 fences and copy exact source.
- `prefers-reduced-motion` renders a single static typewriter word and suppresses the line-draws.
- Zero references to `next`, `react`, `tailwind`, `framer-motion`, `pocketbase` in `package.json` or `src/`.
