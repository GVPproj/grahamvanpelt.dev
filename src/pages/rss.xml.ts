import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.created.getTime() - a.data.created.getTime(),
  )

  return rss({
    title: 'Graham Van Pelt',
    description:
      'Notes on the things I build — Go, PocketBase, Remix and Next, Astro — written up while they are still fresh.',
    site: context.site!,
    // Match the site's trailingSlash: 'never' — links must equal canonicals.
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.created,
      link: `/blog/${post.id}`,
    })),
  })
}
