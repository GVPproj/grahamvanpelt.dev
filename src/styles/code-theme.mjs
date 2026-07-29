/**
 * Syntax highlighting palette, derived from the site tokens in global.css so
 * code blocks read as part of the page rather than as a pasted-in editor
 * screenshot.
 *
 * Two families do the work, exactly as the rest of the site does:
 *   - fuchsia (--colour-accent / --colour-highlight) carries syntax that is
 *     structural: keywords, tags, operators.
 *   - a cool ink/teal/sky ramp carries the things being named: strings,
 *     functions, identifiers.
 * Amber appears once, for literal values, because nothing else in the palette
 * is warm and numbers need to separate from strings at a glance.
 *
 * Every foreground here clears 7:1 against the code-block background
 * (--colour-fill-muted, hsl(204 80% 20%) = #0a3b5c) — WCAG AAA for normal
 * text, which is what 0.875rem code is. Comments included: they are prose and
 * get no contrast discount. Measured ratios are in the comments below; if you
 * change a value, re-measure rather than eyeballing it.
 *
 * Shiki writes `bg` inline on the <pre>; global.css overrides it with
 * !important so this value only matters to consumers that read the theme
 * directly. It is kept in sync anyway.
 */

/* Ratios are against `bg`. The accent tokens themselves (--colour-accent
   #e879f9 at 4.76, --fuchsia-300 at 6.66) are too dark to hit AAA here, so the
   two fuchsias below are those hues lifted in lightness — same family, legible
   on the lighter code surface. */
const bg = '#0a3b5c'
const fg = '#f4f4f5' /* 10.66 */

const fuchsia = '#f2b9fd' /* 7.32 — keywords, structure */
const fuchsiaSoft = '#e9d5ff' /* 8.60 — types, tags */
const teal = '#6ff0da' /* 8.45 — strings */
const sky = '#93dbfd' /* 7.69 — functions */
const amber = '#fcd34d' /* 8.12 — literals */
const slate = '#cbd5e1' /* 7.89 — operators, punctuation */
const comment = '#b3cfde' /* 7.19 — comments */
const invalid = '#fecdd3' /* 8.30 */

const style = (scope, foreground, fontStyle) => ({
  scope,
  settings: fontStyle ? { foreground, fontStyle } : { foreground },
})

/** @type {import('shiki').ThemeRegistration} */
export const codeTheme = {
  name: 'gvp-ink',
  type: 'dark',
  colors: {
    'editor.background': bg,
    'editor.foreground': fg,
  },
  fg,
  bg,
  settings: [
    { settings: { foreground: fg, background: bg } },

    style(['comment', 'punctuation.definition.comment'], comment, 'italic'),

    style(
      [
        'keyword',
        'keyword.control',
        'keyword.operator.new',
        'keyword.operator.expression',
        'storage',
        'storage.type',
        'storage.modifier',
        'variable.language',
        'constant.language',
        'markup.heading',
      ],
      fuchsia,
    ),

    style(
      [
        'entity.name.type',
        'entity.name.class',
        'entity.name.namespace',
        'support.type',
        'support.class',
        'entity.other.inherited-class',
        'entity.name.tag',
      ],
      fuchsiaSoft,
    ),

    style(
      [
        'entity.name.function',
        'support.function',
        'meta.function-call',
        'entity.name.function.decorator',
      ],
      sky,
    ),

    style(
      [
        'string',
        'string.quoted',
        'string.template',
        'constant.character.escape',
        'markup.inline.raw',
        'markup.fenced_code',
      ],
      teal,
    ),

    style(
      [
        'constant.numeric',
        'constant.language.boolean',
        'constant.language.null',
        'constant.language.undefined',
        'constant.other',
        'entity.other.attribute-name',
      ],
      amber,
    ),

    style(
      [
        'variable',
        'variable.other',
        'variable.parameter',
        'meta.object-literal.key',
        'support.variable',
      ],
      fg,
    ),

    style(
      [
        'keyword.operator',
        'punctuation',
        'punctuation.separator',
        'punctuation.definition',
        'meta.brace',
      ],
      slate,
    ),

    /* Diffs read as diffs even without a gutter. */
    style(['markup.inserted', 'meta.diff.header.to-file'], teal),
    style(['markup.deleted', 'meta.diff.header.from-file'], fuchsia),
    style(['markup.changed'], amber),

    style(['invalid', 'invalid.illegal'], invalid),
  ],
}
