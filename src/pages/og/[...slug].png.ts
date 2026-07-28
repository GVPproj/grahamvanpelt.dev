import { readFileSync } from 'node:fs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { getCollection, type CollectionEntry } from 'astro:content'
import type { APIContext } from 'astro'

// Read once at module scope — satori's README flags per-render reads as a
// 2× difference. These are the kit TTFs; satori cannot read the .woff2s the
// site serves, and outside public/ these never ship to visitors.
// Resolved from the project root: the bundled endpoint runs out of dist/,
// so import.meta.url would point at a file that was never copied there.
const wotfardRegular = readFileSync('src/assets/og/wotfard-regular-webfont.ttf')
const wotfardSemibold = readFileSync(
  'src/assets/og/wotfard-semibold-webfont.ttf',
)

// Rosé Pine Moon, matching the site tokens in global.css.
const base = '#232136'
const text = '#e0def4'
const subtle = '#908caa'
const iris = '#c4a7e7'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }))
}

interface Props {
  post: CollectionEntry<'blog'>
}

export async function GET({ props }: APIContext<Props>) {
  const { post } = props

  const date = post.data.created.toLocaleDateString('en-CA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Satori's object-literal form — satori/jsx is still labelled experimental.
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          backgroundColor: base,
          color: text,
          fontFamily: 'Wotfard',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', fontSize: '32px', color: subtle },
              children: date,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: post.data.title.length > 60 ? '64px' : '72px',
                fontWeight: 600,
                lineHeight: 1.15,
              },
              children: post.data.title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '32px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', fontWeight: 600 },
                    children: 'Graham Van Pelt',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', color: iris },
                    children: 'grahamvanpelt.dev',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Wotfard', data: wotfardRegular, weight: 400, style: 'normal' },
        {
          name: 'Wotfard',
          data: wotfardSemibold,
          weight: 600,
          style: 'normal',
        },
      ],
    },
  )

  const png = new Resvg(svg).render().asPng()

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  })
}
