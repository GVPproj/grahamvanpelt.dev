---
title: Typography and Code Test Post
description: "A typography and code fixture used while porting the blog to plain CSS. Deleted before launch."
created: 2026-07-28T12:00:00Z
---

This first paragraph exists to check the leading, the measure, and the colour of
plain body text. It is deliberately long enough to wrap several times at a
typical reading width, because a single short line tells you nothing about how
comfortable a paragraph actually is to read. It also contains **bold text**,
*italic text*, ***both at once***, a [link to somewhere](https://example.com),
some `inline code`, and ~~struck-through text~~ so the inline variants can be
compared against each other in a real sentence rather than in isolation.

A second paragraph, to check the spacing between paragraphs rather than the
spacing inside one.

## A second-level heading

Most posts start their sections here rather than at `h1`, since the title is
rendered separately from the body. The gap above this heading matters more than
the gap below it.

### A third-level heading

Nested a level down. Check that the size step between `h2` and `h3` is still
readable as a hierarchy, and that `h3` doesn't collide with the paragraph above.

#### A fourth-level heading

Rare, but it should not fall apart when it appears.

## Lists

An unordered list:

- A short item.
- A longer item that runs past the end of the line so the hanging indent and the
  wrapped-line alignment can be checked against the bullet.
- An item with `inline code` and a [link](https://example.com) in it.
- A parent item with children:
  - First child.
  - Second child, which also wraps far enough to show how nested items handle
    their own indentation.
    - And a third level, for good measure.

An ordered list:

1. First step.
2. Second step, which wraps onto more than one line so the number alignment can
   be judged properly.
3. Third step.
   1. A nested first step.
   2. A nested second step.

A tight list with paragraphs between items:

- First item.

  A second paragraph belonging to the first item.

- Second item.

## Code blocks

A fenced block with no language, which should still be monospaced and scrollable:

```
$ pnpm install
$ pnpm dev
```

TypeScript, the most common case on this site:

```ts
type Post = {
  title: string
  slug: string
  created: Date
}

export async function getPosts(): Promise<Post[]> {
  const posts = await loadCollection('blog')

  return posts
    .filter((post) => post.created <= new Date())
    .sort((a, b) => b.created.getTime() - a.created.getTime())
}
```

A block with a very long line, to check horizontal overflow rather than wrapping — this is the case that most often breaks a layout, because an unbreakable string can push the whole page sideways if the container doesn't clip it:

```js
const config = { site: 'https://grahamvanpelt.dev', trailingSlash: 'never', build: { format: 'directory' }, markdown: { shikiConfig: { theme: 'css-variables' } } }
```

CSS, which the whole site is about to be written in:

```css
@keyframes draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.sig path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 2s ease-out forwards;
}
```

HTML, to check that tags inside a code block are escaped rather than rendered:

```html
<button popovertarget="menu" aria-label="Open menu">Menu</button>
<nav popover id="menu">
  <a href="/cv">CV</a>
  <a href="/portfolio">Portfolio</a>
  <a href="/blog">Blog</a>
</nav>
```

A short shell block:

```sh
rsync -avz --delete ./dist/ user@host:/var/www/site/
```

## Blockquotes

> A single-line quote.

> A longer quote that runs to several lines, so the left border, the indent, and
> the text colour can all be judged at a realistic length rather than on a
> fragment.
>
> With a second paragraph inside the same quote.

> A quote containing a list:
>
> - One
> - Two
>
> And a closing line.

## A table

| Animation | Verdict    | Notes                                    |
| --------- | ---------- | ---------------------------------------- |
| Sig       | CSS        | `stroke-dashoffset` keyframes, 2s        |
| Face      | CSS        | Same technique, 4s                       |
| FadeIn    | Cut        | Was masking the hydration seam           |
| FadeUp    | Cut        | Takes the `IntersectionObserver` with it |
| Typewriter| Vanilla JS | ~25 lines, no library                    |

Tables are the other common source of horizontal overflow, especially on a
phone.

## An image

![A placeholder describing what the image shows](/images/graham.webp)

Images in posts need a max width, and the caption-less case above is the one
that actually appears in practice.

## A horizontal rule

Text above the rule.

---

Text below the rule.

## Edge cases

A line ending in two spaces produces a hard break —  
this sentence should sit directly beneath the previous one.

A paragraph immediately followed by a heading, with no blank-line cushion in the
rendered output:

## Trailing heading

And a final paragraph, so the last element of the post isn't a heading and the
bottom spacing of the article can be checked.
