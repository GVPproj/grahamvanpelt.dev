# Go + Templ + Datastar for a Mostly-Static Personal Site

Date: 2026-07-28

## Question

What does building a small, mostly-static personal site (home page, markdown blog, CV pages, portfolio) on Go + Templ + Datastar 1.0 actually entail — and does the stack fit the site, or fight it?

---

## 1. Datastar 1.0

### Release status

- **1.0 is released.** The GitHub releases page shows **v1.0.0 on April 16, 2026**, after a long RC series (RC.2 July 2025 → RC.8 March 2026). Current version at time of writing: **v1.0.2 (June 2, 2026)** (https://github.com/starfederation/datastar/releases).
- The homepage presents it as production-ready 1.0 (https://data-star.dev).

### What it is

- A **lightweight hypermedia framework**: server-side rendering plus frontend reactivity, "backend reactivity like htmx and frontend reactivity like Alpine.js," with no npm dependency required (https://data-star.dev/guide/getting_started).
- **Size: 11.76 KiB** as advertised on the homepage (https://data-star.dev).
- State lives on the backend; the browser is driven via `data-*` attributes and **reactive signals**; SDKs exist for Go, Python, TypeScript, Ruby, PHP, Rust and more (https://data-star.dev).
- Install is a single CDN `<script type="module">` tag or self-hosted bundle (https://data-star.dev/guide/getting_started).

### API shape as of 1.0

(https://data-star.dev/reference/attributes, https://data-star.dev/guide/getting_started)

- **Attributes** (note 1.0 switched the keyed-attribute delimiter to a colon, e.g. `data-on:click`):
  - `data-signals` — patch signals into frontend state
  - `data-bind` — two-way binding between element and signal
  - `data-text`, `data-show`, `data-class:*`, `data-attr:*`, `data-style:*` — bind content/visibility/classes/attributes/styles to expressions
  - `data-on:*` — event listeners running expressions (`<button data-on:click="@get('/endpoint')">`)
  - `data-computed`, `data-effect`, `data-init`, `data-ref`, `data-indicator`
- **Actions**: `@get()`, `@post()` etc. issue fetch requests to the backend.
- **Backend responses**: plain `text/html` (morphed into the DOM by element ID) or `text/event-stream` SSE with events like **`datastar-patch-elements`** and **`datastar-patch-signals`**; morphing updates only changed DOM parts.
- **Go SDK**: `github.com/starfederation/datastar-go/datastar` (requires Go 1.24+) — `NewSSE(w, r)`, `PatchElements(html)`, `RemoveElement(selector)`, `MarshalAndPatchSignals(...)`, `ReadSignals(r, ...)`, `ExecuteScript(js)`, `Redirect(path)` (https://github.com/starfederation/datastar-go).

### Honest fit assessment for this site

Datastar's whole value proposition is **server-driven reactivity**: signals synced with a backend, SSE streams patching the DOM. A home page, markdown blog, CV, and portfolio have essentially **zero server-driven state** — every page is the same for every visitor. On such a site Datastar is mostly dead weight: you'd ship an 11.76 KiB runtime plus attribute wiring to do things a `<a href>` already does.

What *could* justify it, minimally:

- **Contact form** — `data-bind` on inputs + `@post('/contact')` + a patched success/error fragment is a genuinely nice fit, and the Go SDK makes the handler a few lines. (But a plain HTML `<form method="post">` also works, with a redirect-after-post.)
- **Live search over posts** — `data-on:input` debounced `@get('/search?q=...')` returning an HTML fragment. This is real hypermedia value, though for ~20 blog posts a 5 KB client-side index in vanilla JS is equally viable.
- **Theme toggle** — does *not* justify it: a dark-mode toggle is ~10 lines of vanilla JS + `localStorage` + a `data-theme` attribute; involving a server framework for it is overkill.

Verdict for this section: for the site as described, plain HTML/CSS plus a sprinkle of vanilla JS covers everything. Datastar becomes worth it only if you actually want server-backed interactivity (form handling with inline validation, server-side search, or a future dynamic feature like comments/analytics dashboards).

---

## 2. Templ workflow

(https://templ.guide, https://github.com/a-h/templ/releases)

- **Authoring**: write components in `.templ` files using Go-like syntax with native Go control flow (`if`, `for`, `switch`); components compose into pages.
- **Codegen**: `templ generate` compiles `.templ` files into `*_templ.go` Go source. This step is mandatory before `go build` sees your templates.
- **LSP / editors**: templ ships an LSP (`templ lsp`) for autocompletion and diagnostics; editor setup is documented for the major editors (https://templ.guide).
- **Hot reload**: `templ generate --watch` regenerates on save and runs a **reload proxy on port 7331** that auto-refreshes the browser (https://templ.guide).
- **net/http integration**: components implement a `Render(ctx, w)`-style interface and drop straight into `net/http` handlers; templ explicitly supports both server-side rendering and **"Static rendering: Create static HTML files to deploy however you choose"** (quoted from https://templ.guide).
- **Version status**: templ is still **pre-1.0** — latest release **v0.3.1020 (May 10, 2026)** (https://github.com/a-h/templ/releases). Pre-1.0 means occasional breaking changes between minor versions; upgrading the CLI and the Go module must stay in lockstep.

### Friction to expect

- Generated `*_templ.go` files either get committed (noise in diffs) or regenerated in CI — either way, **CI/build must run `templ generate` before `go build`**, and the templ CLI version must match the `templ` module version.
- Type errors in templates surface in generated files, which can be confusing without the LSP running.

---

## 3. Serving markdown blog posts from Go

- **Go's standard library has no markdown package** — you need a third-party renderer.
- **goldmark** (`github.com/yuin/goldmark`) is the de-facto choice and the parser Hugo uses: "a markdown parser written in Go. Easy to extend, standard(CommonMark) compliant" — compliant with **CommonMark 0.31.2**, with `extension.GFM` (tables, strikethrough, task lists), footnotes, and syntax highlighting via goldmark-highlighting (https://github.com/yuin/goldmark).
- **go:embed** (std lib since Go 1.16) bundles the posts into the binary: `//go:embed posts/*.md` into an `embed.FS`, which "implements fs.FS, so it can be used with any package that understands file system interfaces, including net/http" (https://pkg.go.dev/embed). Result: a single self-contained binary, no files to rsync.

### Rendering strategy options

1. **Render at startup** — walk the embedded FS, render every post to HTML once, hold in memory. Best default for a personal blog: request path serves pre-rendered bytes; content only changes on redeploy anyway.
2. **Render per-request** — simplest code, wasteful; goldmark is fast but re-parsing identical markdown on every hit buys nothing. Only sensible with caching, which is just option 1 with extra steps.
3. **Render at build time to static HTML** — use the same Go program (templ explicitly supports static rendering, https://templ.guide) as a generator: emit `public/` and host it anywhere. This removes the server entirely — at which point you've built a small bespoke Hugo.

---

## 4. Hosting

### Always-on Go server

- **Fly.io** (https://fly.io/docs/about/pricing/): pay-as-you-go; cheapest **shared-cpu-1x / 256 MB ≈ $2.02/mo** (region-dependent); egress $0.02/GB (NA/EU). **No free tier for new customers** — the old "3 free shared-cpu VMs" allowance only applies to legacy pre-October-2024 plans.
- **Hetzner Cloud** (https://www.hetzner.com/cloud — prices are dynamically loaded on the page; figures below are from Hetzner's press page https://www.hetzner.com/pressroom/new-cx-plans/ and third-party trackers of the April 2026 price change): cheapest shared plans **CX22 ≈ €4.49/mo** (2 vCPU, 4 GB RAM, 40 GB) and ARM **CAX11 ≈ €4.49/mo + ~€0.50 IPv4**, with 20 TB traffic included. Treat the exact euro figures as "as of April 2026"; confirm in the Hetzner console since the site doesn't render them statically.
- **VPS ops burden** (Hetzner-style): you own TLS certificates (Caddy/certbot), OS security updates, a systemd unit or container runtime, firewall, and a deploy mechanism (scp binary / git pull / CI + SSH). Fly.io removes the OS layer but you still manage `fly deploy`, Dockerfiles or buildpacks, and machine sizing.

### Static hosting

- **Netlify Free** (https://www.netlify.com/pricing/, https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/): **$0, credit-based — 300 credits/mo** on Free. Costs: production deploy 15 credits, bandwidth 20 credits/GB, web requests 2 credits/10K, form submissions free (since April 14, 2026). When credits run out, Free-plan sites are **paused** ("Site not available") until the next cycle or an upgrade; you cannot buy extra credits on Free. Practically: ~a handful of deploys plus a few GB of traffic per month fits a low-traffic personal site, but note the ceiling is much lower than the old 100 GB/300-build-minute legacy free tier (which grandfathered accounts keep). Ops burden: effectively zero — git push, TLS, and global CDN included.
- **Escape hatch**: because a Go+templ program can emit static HTML at build time (https://templ.guide), you can keep the Go/templ/goldmark authoring stack and still deploy to Netlify — making Datastar and the live server optional, not foundational.

---

## 5. Where this stack fights the site's static nature

**Fights it:**

- **Codegen tax**: `templ generate` (against a pre-1.0, occasionally breaking CLI) sits between editing a template and building — vs. zero build for hand-written HTML.
- **Always-on server for content that never changes**: $2–5/mo and a process to babysit, to serve bytes that are identical for every visitor.
- **SSE machinery unused**: Datastar's core mechanism — `datastar-patch-elements` streams, signals, the Go SDK — has nothing to do on a brochure site; the 11.76 KiB runtime and mental model are cargo.
- **No CDN edge caching by default**: a lone Fly machine or Hetzner VPS serves every request from one region; Netlify's free plan puts static files on a global CDN out of the box. You'd have to add Cache-Control headers and a CDN yourself.
- **Deploy pipeline**: build binary → ship → restart (plus TLS/updates on a VPS), vs. git-push-to-Netlify.

**Where it shines:**

- **Single binary**: go:embed folds posts, templates, and assets into one artifact — deployment is copying one file.
- **Type safety end to end**: templ components are compiled Go; broken links between data and markup fail at build, not in production.
- **Room to grow**: if the site ever wants a contact form with inline validation, server-side search, comments, or live features, Datastar + the Go SDK is a genuinely small step from here, whereas a static site would need re-platforming.
- **Hybrid escape hatch**: the same codebase can render static HTML at build time, so the stack choice isn't one-way.

## Verdict

For the site as described, the stack is over-provisioned: the honest minimum is Go + templ + goldmark run as a **static generator**, deployed to Netlify's free tier for $0 and zero ops. Datastar 1.0 (real, shipped, 11.76 KiB, well-designed) only earns its place the day the site gains server-backed interactivity — a contact form or live search is the plausible on-ramp — and at that point a ~$2–5/mo Fly.io machine or Hetzner CX22 plus the Datastar Go SDK is a clean upgrade path rather than a rewrite. Building it server-first from day one buys future flexibility at the cost of a codegen step, a monthly bill, and ops work that a personal blog does not need yet.

## Sources

- https://data-star.dev
- https://data-star.dev/guide/getting_started
- https://data-star.dev/reference/attributes
- https://github.com/starfederation/datastar/releases
- https://github.com/starfederation/datastar-go
- https://templ.guide
- https://github.com/a-h/templ/releases
- https://pkg.go.dev/embed
- https://github.com/yuin/goldmark
- https://fly.io/docs/about/pricing/
- https://www.hetzner.com/cloud (prices dynamically loaded; not verifiable from static page)
- https://www.netlify.com/pricing/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/
