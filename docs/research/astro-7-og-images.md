# Per-Post Open Graph Cards in Astro 7 (Static, No Adapter)

**Date:** 2026-07-28

**Research question:** How should this site generate per-post 1200×630 PNG Open Graph cards at build time, from a static endpoint at `src/pages/og/[...slug].png.ts` driven by `getStaticPaths()` over `getCollection('blog')`, under a pure static Astro 7 build (`output: 'static'`, **no adapter**) deployed to Netlify, on Node ≥ 22.12?

All claims below are sourced from primary sources only: docs.astro.build, the npm registry API, and the projects' own GitHub repos (README, CHANGELOG, releases, issues). No blog posts, no tutorials.

---

## Recommendation (one mechanism)

**Hand-rolled `satori` + `@resvg/resvg-js` in a static endpoint.**

Satori turns a JSX-ish tree into an SVG string; resvg-js rasterizes that SVG to a PNG buffer; the endpoint returns it in a `Response`. Astro writes the bytes to `dist/og/<slug>.png` at build time. Nothing about this needs an adapter, a server, or `output: 'server'`.

Why this over `astro-og-canvas` (the main alternative, which is genuinely maintained and Astro-7-ready — see §1):

- **It is the exact shape you asked for.** You write your own `getStaticPaths()` over `getCollection('blog')` and your own `GET`. `astro-og-canvas` inverts this: `OGImageRoute()` *returns* `getStaticPaths` and `GET` for you and expects a `pages` object, so the collection query gets flattened into its data model rather than being your route.
- **Full design control.** `astro-og-canvas` renders a fixed layout (title / description / logo / border / bg gradient, configured via options). Satori gives you flexbox and arbitrary CSS-subset markup, so the card can actually resemble the site.
- **No CanvasKit-wasm.** `astro-og-canvas` pulls in `canvaskit-wasm` (a multi-MB Skia WASM build) as a runtime dependency; satori's layout engine (`yoga-layout`) plus a Rust N-API rasterizer is a lighter, more inspectable build-time dependency set.
- **Satori is the more actively maintained of the two on a release-cadence basis** (0.29.0 published 2026-07-23, four releases in July 2026 alone).

The one real cost — converting a Wotfard weight out of `.woff2` — is identical for both mechanisms, so it does not discriminate between them (§3).

**Fallback if satori's CSS subset proves too limiting or resvg-js's staleness becomes a problem:** `astro-og-canvas@0.13.0`. It explicitly declares `astro: "^5.0.0 || ^6.0.0 || ^7.0.0"` and needs no adapter either.

### Exact dependencies

```jsonc
// package.json — devDependencies (build-time only; nothing ships to the browser)
{
  "satori": "0.29.0",           // published 2026-07-23
  "@resvg/resvg-js": "2.6.2"    // published 2024-03-26
}
```

- **No `react` / `react-dom` needed.** Satori ships an experimental builtin JSX runtime: `/** @jsxRuntime automatic */` + `/** @jsxImportSource satori/jsx */` pragmas at the top of the endpoint file, with types from `satori/jsx` ([satori README, "Experimental: builtin JSX support"](https://github.com/vercel/satori#jsx)). If you'd rather avoid an experimental path entirely, satori also accepts plain `{ type, props }` objects with no transpiler at all ([satori README, "Use without JSX"](https://github.com/vercel/satori#use-without-jsx)) — that is the zero-risk option and worth defaulting to for a three-post blog.
- **No Astro coupling in either package.** `satori@0.29.0` declares no `peerDependencies` and no Astro dependency; `@resvg/resvg-js@2.6.2` declares no `dependencies` and no `peerDependencies` at all (only platform `optionalDependencies`). Verified against the npm registry (`https://registry.npmjs.org/satori`, `https://registry.npmjs.org/@resvg/resvg-js`).

### Font decision

**Convert `wotfard-regular-webfont.woff2` (and one bold-ish weight, e.g. `semibold`) to `.ttf` with `fonttools`, commit the `.ttf` files, and load them as `Buffer`s in the endpoint.**

Satori **cannot read `.woff2`** — this is stated flatly in its README (§3). This repo stores Wotfard **only** as `.woff2` (14 files, all `.woff2`, 30–36 KB each). So a conversion is mandatory if the cards are to use the brand typeface.

Measured cost, converting the actual files in this repo with `fontTools` 4.x:

| Weight | `.woff2` (current) | → `.ttf` | → `.woff` |
| --- | --- | --- | --- |
| regular | 31,908 B (31 KB) | **99,556 B (97 KB)** | 46,972 B (46 KB) |
| semibold | 33,060 B (32 KB) | **100,116 B (98 KB)** | 48,312 B (47 KB) |
| medium | 33,004 B (32 KB) | **100,288 B (98 KB)** | 48,520 B (47 KB) |

Conversion command (one-off, output committed):

```sh
pip install "fonttools[woff]"
python -c "from fontTools.ttLib import TTFont; f=TTFont('src/app/fonts/wotfard/wotfard-regular-webfont.woff2'); f.flavor=None; f.save('src/assets/og/wotfard-regular.ttf')"
```

Notes:

- **`.woff` also works and is half the size** (satori supports TTF, OTF **and** WOFF). Set `f.flavor='woff'` instead of `None` for a ~46 KB file. Satori's author's own guidance is that TTF/OTF parse faster server-side and size only matters when there is a size limit — at build time there is none, so either is fine. **Recommendation: `.ttf`**, matching the maintainer's server-side recommendation; ~200 KB total for two weights is negligible in a git repo that already carries ~480 KB of `.woff2`.
- **These files are build-time only.** They go somewhere outside `public/` (e.g. `src/assets/og/`) so they are never served to browsers; the site keeps shipping `.woff2` to visitors. There is no double-download.
- **Fallback option if you'd rather not commit a font at all:** pass no brand font and use a bundled/system face. This is *not* free — satori **requires** at least one font (`fonts` is mandatory when any text is rendered), and it does not fall back to system fonts, so "no font" is not a state satori has. You would have to add a dependency that carries a `.ttf` (e.g. an `@fontsource/*` package, which ships TTF alongside WOFF2) — roughly the same on-disk cost as the conversion, but with an off-brand card. Not recommended.
- **Rasterization does not need fonts.** Satori embeds text as `<path>` data by default (`embedFont: true`), so resvg-js never has to resolve a font ([satori README, "Fonts"/`embedFont`](https://github.com/vercel/satori#embedfont)). This removes the classic "works locally, wrong glyphs on CI" failure mode entirely.

---

## 1. `astro-og-canvas` — maintained, and Astro 7 is explicitly supported

Verified against [npm registry](https://registry.npmjs.org/astro-og-canvas) and [github.com/delucis/astro-og-canvas](https://github.com/delucis/astro-og-canvas).

- **Latest version: `0.13.0`, published 2026-06-30** (release [`astro-og-canvas@0.13.0`](https://github.com/delucis/astro-og-canvas/releases)). Release cadence over the last seven months: 0.8.0 (2026-01-01), 0.9.0/0.10.0 (2026-01-03), 0.10.1 (2026-02-01), 0.11.0 (2026-04-01), 0.11.1 (2026-04-17), 0.12.0 (2026-06-26), 0.13.0 (2026-06-30). **This is a maintained package**, not abandonware.
- **Peer dependencies: `{"astro": "^5.0.0 || ^6.0.0 || ^7.0.0"}`.** Astro 5, 6 and 7 are all accepted.
- **Astro 7 support history:** issue [#185 "Support Astro 7"](https://github.com/delucis/astro-og-canvas/issues/185) was opened 2026-06-25 ("Peer dependencies currently only include 5 and 6") and closed 2026-06-26 by PR [#186 "feat: add support for Astro 7"](https://github.com/delucis/astro-og-canvas/pull/186), shipped as **0.12.0** — CHANGELOG entry: *"Added support for Astro 7."* Turnaround was **one day** after Astro 7.0's release. The repo also tracks Astro releases via Renovate (PRs updating to `^7.0.3`, `^7.0.7`, `7.1.0`).
- **Engines / Node:** `0.13.0` declares **no `engines` field** on npm. However the CHANGELOG for **0.11.0** notes: *"⚠️ Potentially breaking change: The minimum supported Node version is now 20.19.0"* (a consequence of bumping `entities` to v8). Node 22.12 clears this comfortably.
- **Runtime dependencies:** `canvaskit-wasm@^0.41.1`, `deterministic-object-hash@^2.0.2`, `entities@^8.0.0`. Note the pnpm caveat in the README: pnpm users must install `canvaskit-wasm` as a direct dependency.
- **`astro/zod` (zod moved into the `astro` namespace in Astro 6): no impact.** `astro-og-canvas@0.13.0` has **no zod dependency of any kind** — it does not import `z` from `astro:content` or `astro/zod`, so the Astro 6 relocation could not affect it. A GitHub issue search for `repo:delucis/astro-og-canvas zod` returns no substantive hits (only a dependabot json5 PR matched on noise). The zod change is your problem in `src/content.config.ts`, not this package's.
- **Breaking change to be aware of if you do adopt it:** `0.13.0` **removed the `param` option** to `OGImageRoute()` — the route param name is now auto-detected from the endpoint filename ([CHANGELOG 0.13.0](https://github.com/delucis/astro-og-canvas/blob/main/packages/astro-og-canvas/CHANGELOG.md), PR #189). Any older snippet you copy will still pass `param: 'slug'` and needs it deleted.
- **Open issues worth knowing (12 open total):** [#202 "memory leak and reuse image decode"](https://github.com/delucis/astro-og-canvas/issues/202) (opened 2026-07-25, three days ago — relevant to build memory on large sites, not to 3 posts), [#125 "Support build caching / not rebuilding images if they already exist?"](https://github.com/delucis/astro-og-canvas/issues/125), [#68 "Multiple variations for a single font family do not work"](https://github.com/delucis/astro-og-canvas/issues/68) (open since 2024-08 — a real limitation if you want regular + bold Wotfard on one card), [#77 "Accept raw font contents rather than just a file path or URL"](https://github.com/delucis/astro-og-canvas/issues/77).
- **Fonts:** configured as an array of file paths or URLs — `fonts?: string[]`, documented as *"Array of font URLs or file paths to load and use when rendering text, e.g. `['./src/fonts/local-font.ttf', 'https://example.com/cdn/remote-font.ttf']`"*. Every example in the README uses `.ttf`. It renders via CanvasKit (Skia).

**Verdict on this option:** viable and low-risk, but its fixed layout and the open multi-weight font bug (#68) make it the wrong tool if the card should look like the site.

---

## 2. `satori` + `@resvg/resvg-js` — versions, Node, binaries, coupling

### satori

Verified against [npm registry](https://registry.npmjs.org/satori) and [github.com/vercel/satori](https://github.com/vercel/satori).

- **Latest: `0.29.0`, published 2026-07-23.** Very active: 0.27.0 (2026-04-30), 0.28.0 (2026-07-14), 0.28.1 (2026-07-20), 0.28.2 (2026-07-21), 0.29.0 (2026-07-23). Recent features per [GitHub releases](https://github.com/vercel/satori/releases): webp image support (0.29.0), CSS variables (0.24.x/0.25.0), builtin minimal JSX runtime (0.26.0).
- **Engines: `{"node": ">=16"}`.** README: *"Satori can be directly used in browser, Node.js (>= 16), and Web Workers."* Node 22.12 is fine.
- **Astro coupling: none.** No `peerDependencies`. Dependencies are all rendering-domain: `@shuding/opentype.js`, `yoga-layout@^3.2.1`, `css-to-react-native`, `css-background-parser`, `css-box-shadow`, `css-gradient-parser`, `emoji-regex-xs`, `escape-html`, `linebreak`, `parse-css-color`, `postcss-value-parser`.
- **Caveat to plan around:** satori is **not a full CSS engine** — README: *"Satori uses the same Flexbox layout engine as React Native, and it's **not** a complete CSS implementation."* Flexbox only (no grid), no 3D transforms, JSX must be pure and stateless (no `useState`/`useEffect`/`dangerouslySetInnerHTML`). Design the card within that.

### @resvg/resvg-js

Verified against [npm registry](https://registry.npmjs.org/@resvg/resvg-js) and [github.com/thx/resvg-js](https://github.com/thx/resvg-js).

- **Latest stable: `2.6.2`, published 2024-03-26.** ⚠️ **This is the one maintenance concern in the whole stack** — the stable tag has not moved in over two years. There *is* ongoing work on the `next` tag: `2.6.3-alpha.0` … `2.6.3-alpha.3` (2025-09 → 2026-01), then `2.7.0-alpha.0/1/2` (2026-01-22 → 2026-01-28). But nothing has been promoted to stable since March 2024, and even the alphas went quiet six months ago. It is a thin N-API wrapper around the Rust `resvg` crate rendering a fixed input format (SVG → PNG), so staleness is much less dangerous here than it would be in a framework dependency — but it is the component most likely to need replacing in a couple of years.
- **Engines: `{"node": ">= 10"}`.** No upper bound. The README's support matrix lists **Node.js 12 through 22** as supported across every platform row. Node 22.12 is covered; Node 24 is untested by the project (see Unverified).
- **Prebuilt binaries: yes, for both architectures you need.** Distributed as platform `optionalDependencies` — npm/pnpm installs only the matching one, and *"No need for node-gyp and postinstall, the `.node` file has been compiled for you."*
  - **Dev machine (aarch64 Linux, glibc):** [`@resvg/resvg-js-linux-arm64-gnu@2.6.2`](https://www.npmjs.com/package/@resvg/resvg-js-linux-arm64-gnu), published 2024-03-26, `cpu: ["arm64"]`, `os: ["linux"]`, `libc: ["glibc"]`, main `resvgjs.linux-arm64-gnu.node`, unpacked 3,867,871 B (3.7 MB). ✅ Prebuilt.
  - **Netlify build (x64 Linux, glibc):** [`@resvg/resvg-js-linux-x64-gnu@2.6.2`](https://www.npmjs.com/package/@resvg/resvg-js-linux-x64-gnu), published 2024-03-26, `cpu: ["x64"]`, `os: ["linux"]`, `libc: ["glibc"]`, unpacked 4,384,036 B (4.2 MB). ✅ Prebuilt.
  - `linux-x64-musl` and `linux-arm64-musl` also exist (2.6.2), so an Alpine-based CI would work too.
  - Full set of 12 platform packages: darwin x64/arm64, linux x64 gnu/musl, linux arm64 gnu/musl, linux arm gnueabihf, win32 x64/ia32/arm64 msvc, android arm64/arm-eabi.
  - **Lockfile caution:** if the lockfile is generated on aarch64 and used on x64 CI, make sure the install does not prune the x64 optional dep. npm/pnpm handle this correctly for `cpu`/`os`-gated optional deps, but a lockfile committed with `--no-optional` or copied `node_modules` will break the Netlify build with a "failed to load native binding" error.
- **Astro coupling: none.** Zero `dependencies`, zero `peerDependencies`.

---

## 3. CRITICAL: satori does **not** support `.woff2`

Directly from [the satori README](https://github.com/vercel/satori#fonts), verbatim:

> Satori currently supports three font formats: TTF, OTF and WOFF. Note that WOFF2 is not supported at the moment. You must specify the font if any text is rendered with Satori, and pass the font data as ArrayBuffer (web) or Buffer (Node.js)

Two things follow, and both matter:

1. **Supported: TTF, OTF, WOFF. Not supported: WOFF2.**
2. **Fonts are mandatory**, not optional — *"You must specify the font if any text is rendered."* There is no system-font fallback.

**Has this changed recently? No.** The stance is old and deliberate. Issue [vercel/satori#3 "Woff2 support"](https://github.com/vercel/satori/issues/3) was opened 2022-02-02 and closed 2022-10-10; the maintainer's comment on it (2022-03-19):

> Decided to put a lower priority on this. TTF & OTF are faster to load and parse, so on the server side we will always recommend using them unless there's a size limitation. WOFF is a good balance of size and parsing speed (smaller but slightly longer to load).

The README statement is still present in `main` as of 2026-07-28, having survived README edits through 0.29.0. Treat "no woff2" as a permanent design decision, not a temporary gap.

### What this repo has

`src/app/fonts/wotfard/` contains **14 files, every one of them `.woff2`**, 30,696–35,628 B each:

```
wotfard-thin / extralight / light / regular / medium / semibold / bold   (7 weights)
  × upright + italic                                                     (= 14 files)
```

There is **no `.ttf`, `.otf` or `.woff` for Wotfard anywhere in the repo.** (For contrast, `src/app/fonts/sfizia/` *does* ship `.woff` alongside `.woff2`, and `GeistVF.woff` / `GeistMonoVF.woff` exist — those three faces would work with satori as-is. Wotfard is the one that doesn't.)

### Exact cost of each path

**Path A — convert and commit (recommended).**
- Tool: **`fonttools`** (`pip install "fonttools[woff]"`; the `[woff]` extra pulls in `brotli`, required to *decompress* woff2). One-off, three lines of Python, no build-step dependency. Alternatives that work equally well: Google's `woff2_decompress` CLI from `google/woff2`, or `fonttools ttLib` via `pyftfeatfreeze`-style wrappers.
- **Measured output for this repo's actual files:** `wotfard-regular-webfont.woff2` 31,908 B → **`.ttf` 99,556 B (97 KB)** or **`.woff` 46,972 B (46 KB)**. Semibold: 33,060 B → 100,116 B `.ttf` / 48,312 B `.woff`. So **two weights as TTF ≈ 195 KB added to the repo**, or ≈ 95 KB as WOFF. The conversion is lossless re-containering (same `glyf` outlines, just un-Brotli'd); rendering is identical.
- Runtime cost in the endpoint: `fs.readFileSync()` the buffer once at module scope and reuse it across all `GET` calls — satori's README explicitly recommends this (*"define global fonts instead of creating a new object and pass it to satori for better performance"*, linking [issue #590 "2x faster with SatoriOptions.fonts as a global variable"](https://github.com/vercel/satori/issues/590)).

**Path B — bundled/system font fallback.**
- Not actually "free": satori has no system-font fallback and requires a font buffer, so you must still supply a TTF/OTF/WOFF from *somewhere*. In practice that means adding an `@fontsource/<something>` dev-dependency (those ship `.ttf` files) purely for the cards — comparable disk cost to Path A, but the card no longer matches the site's typography.
- Only worth it if committing a converted brand font is objectionable for licensing reasons (Wotfard is a commercial face — check that the licence permits shipping a `.ttf` in a repo, even a build-time-only one; a webfont licence sometimes restricts the format you may distribute). **This is the one genuine reason to prefer Path B, and it is a licensing question, not a technical one.**

**Path C — pre-convert at build time instead of committing.** Possible (a tiny script using `wawoff2`/`fonteditor-core` in a `prebuild` step) but it adds a runtime dependency and a build step to avoid committing 195 KB. Not worth it here.

---

## 4. Yes — a PNG endpoint works under `output: 'static'` with no adapter

Per [the endpoints guide](https://docs.astro.build/en/guides/endpoints/):

- **Filename convention is unchanged and still produces the route you want.** *"The `.js` or `.ts` extension will be removed during the build process, so the name of the file should include the extension of the data you want to create."* `src/pages/data.json.ts` → `/data.json`; the docs' own image example is `src/pages/astro-logo.png.ts` → `/astro-logo.png`. So **`src/pages/og/[...slug].png.ts` → `/og/<slug>.png`.** ✅
- **`getStaticPaths` is still the mechanism for dynamic endpoints.** *"Dynamic routing with endpoints works the same as it does with pages"* — bracketed params plus an exported `getStaticPaths()`. ✅
- **Return type is a standard `Response`.** The docs' binary example is:

  ```ts
  export async function GET({ params, request }) {
    const response = await fetch("https://docs.astro.build/assets/full-logo-light.png");
    return new Response(await response.arrayBuffer());
  }
  ```

  An `ArrayBuffer` body is documented; a Node `Buffer` (which is a `Uint8Array`) is an acceptable `BodyInit` too, so `new Response(resvg.render().asPng())` works directly. Since Astro v3.0 the returned `Response` no longer needs an `encoding` property — **any snippet you find that passes `{ encoding: 'binary' }` is pre-v3 and stale.** ✅
- **Static-first, no adapter.** *"Static file endpoints work in statically-generated sites by default"*; only in SSR mode do they become live request-time endpoints. Combined with the Netlify guide's *"Your Astro project is a static site by default. You don't need any extra configuration to deploy a static Astro site to Netlify"* ([Netlify deploy guide](https://docs.astro.build/en/guides/deploy/netlify/)), the no-adapter requirement is satisfied. ✅
- **Set `Content-Type: image/png` explicitly** on the `Response` headers. It doesn't affect the emitted file bytes in a static build (Netlify serves by extension), but it keeps `astro dev` correct.

### Astro 7 breaking changes to endpoints

**There are none.** The [v7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/) documents **no breaking changes** to endpoints, API routes, `getStaticPaths`, static file generation, or `Response` handling. The v7 changes that touch this area only tangentially:

- **`src/fetch.ts` is now a reserved filename** for the new advanced-routing entrypoint. Irrelevant to `src/pages/og/[...slug].png.ts`, but don't create `src/fetch.ts` for anything else.
- **Vite 8 / Rolldown.** Matters only if you write Vite plugins. Note the endpoint imports a Node-only native module (`@resvg/resvg-js`) and reads a font from disk — both are fine in Astro's build-time server context, but do not import that endpoint's helpers from any client-side code.
- **Stricter Rust compiler / `compressHTML: 'jsx'`.** `.astro` template concerns only; endpoints emit no HTML.
- **zod moved to `astro/zod`** (an Astro **6** change, carried forward). This affects your `src/content.config.ts` schema — `import { z } from "astro/zod"` — which is upstream of `getCollection('blog')` and therefore of `getStaticPaths`. It does not affect the endpoint itself.

---

## 5. Build-time cost for ~3 posts

**No first-party benchmark exists for this workload.** Stating that plainly:

- **satori publishes no benchmark numbers** — no benchmark section in the README, no timing claims in the release notes. The only performance statement is qualitative: reuse the `fonts` array as a global for a **2× speedup** ([issue #590](https://github.com/vercel/satori/issues/590), linked from the README).
- **resvg-js publishes a benchmark, but not a comparable one.** Its README's "Sample Benchmark" is a *resize* suite (`resvg-js(Rust): 12 ops/s`, vs `sharp: 9 ops/s`, `skr-canvas: 7 ops/s`, `svg2img: 6 ops/s`) on an unspecified input. The README's runnable example prints `✨ Done in 55.65 ms` for one SVG→PNG render, but that is a specific sample file at an unspecified output size, not a 1200×630 OG card. **Neither number should be quoted as "OG card render time."**

### Estimate (clearly marked as an estimate — not measured, not sourced)

Extrapolating from resvg-js's own ~50–65 ms single-render figure and from satori's Yoga-layout-plus-opentype.js work being pure JS:

| Stage | Per card (est.) |
| --- | --- |
| Font parse (once, module scope, amortized) | ~30–80 ms **one time**, not per card |
| satori: layout + SVG string (with `embedFont: true` path outlining) | ~50–150 ms |
| resvg-js: rasterize 1200×630 → PNG | ~40–100 ms |
| **Per card total** | **~100–250 ms** |

**For 3 posts: roughly 0.3–0.8 s of added build time, plus a one-time ~1–3 s cold cost for module load / native binding load / font parse.** Call it **under 5 seconds total**, and effectively invisible next to Astro 7's own build. Even at 100 posts this stays in the 10–25 s range, which is where you'd start wanting caching. **This is an estimate; measure it once the endpoint exists rather than trusting the table.**

Two things that would make it worse, worth knowing in advance:
- Re-reading and re-parsing the font inside `GET` instead of at module scope (the 2× penalty satori warns about).
- Remote images or remote fonts fetched per card — keep everything local and inline images as data URIs.

`astro-og-canvas` sidesteps this differently: it has a built-in **build cache** (`./node_modules/.astro-og-canvas` by default, settable to `false`). The satori path has no such cache; at 3 posts it doesn't need one, and [`astro-og-canvas#125`](https://github.com/delucis/astro-og-canvas/issues/125) shows even that project's caching story is still in flux.

---

## Could NOT verify

Everything below is genuinely unresolved. Do not treat any of it as fact.

1. **Whether `astro-og-canvas` / CanvasKit accepts `.woff2`.** The README documents `fonts?: string[]` as *"font URLs or file paths"* and every example uses `.ttf`, but neither the README nor any issue I found states the accepted format set explicitly. Skia (CanvasKit's engine) is generally TTF/OTF-only, but I could not find a primary Skia/CanvasKit source confirming this within scope. **If you take the `astro-og-canvas` fallback, assume you still need the TTF conversion from §3 and verify empirically.**
2. **Exact `satori@0.29.0` publish date on GitHub vs npm.** npm says 2026-07-23T14:33:11Z, the GitHub release says 2026-07-23T14:33:19Z. Trivially consistent; noted only for completeness.
3. **Whether resvg-js 2.6.2's prebuilt binaries run cleanly on Node 24+.** The README support matrix stops at Node.js 22, and 2.6.2 predates Node 24. Node 22.12 (this project's floor, and Astro's) is explicitly in the matrix, so this is a future concern only — but if Netlify's build image jumps to Node 24, verify before assuming.
4. **Netlify's current default Node version on its build image.** The Astro Netlify guide says to pin via `.nvmrc` or `NODE_VERSION` and describes the default as "a modern Node" without naming it. Pin `.nvmrc` to a Node 22.x ≥ 22.12 and stop worrying.
5. **Any real measured render time for a 1200×630 satori+resvg card.** No first-party benchmark exists (§5). The table in §5 is reasoning, not data.
6. **Wotfard's licence terms regarding distributing a `.ttf`.** Not a technical question and not something I could check — but it is the one thing that could force Path B in §3. Check the licence before committing the converted file.
7. **Whether `astro-og-canvas`'s open memory-leak issue [#202](https://github.com/delucis/astro-og-canvas/issues/202) (opened 2026-07-25) has a known trigger threshold.** Three days old, no resolution. Almost certainly irrelevant at 3 posts, but unquantified.
8. **Whether satori's builtin JSX runtime (`satori/jsx`) has graduated from "experimental."** The README still labels it experimental as of 2026-07-28, three releases after it landed in 0.26.0. No release note declares it stable. Prefer the object-literal form (`{ type, props }`) if you want zero experimental surface.

---

## Verdict

**Use `satori@0.29.0` + `@resvg/resvg-js@2.6.2` in `src/pages/og/[...slug].png.ts`, with `getStaticPaths()` mapping `await getCollection('blog')` to `{ params: { slug: post.id }, props: { post } }`, and `GET` returning `new Response(png, { headers: { 'Content-Type': 'image/png' } })`.** No adapter, no config change, no Astro 7 breaking change in the way.

The single piece of preparatory work is the font: **convert `wotfard-regular-webfont.woff2` (+ one bold weight) to `.ttf` with `fonttools` and commit ~195 KB to `src/assets/og/`** — satori will not read `.woff2` and this is a settled upstream decision, not a bug awaiting a fix. Load the buffers once at module scope.

The one thing to keep an eye on is `@resvg/resvg-js`'s stable release having been frozen since March 2024. It works, it is prebuilt for both aarch64-linux-gnu (dev) and x64-linux-gnu (Netlify), and its job is narrow enough that stagnation is tolerable — but it is the component to revisit first if something breaks.
