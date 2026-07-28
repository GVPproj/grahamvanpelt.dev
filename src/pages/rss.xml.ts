import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { BLOG_DESCRIPTION, getSortedPosts } from '../data/blog'

export async function GET(context: APIContext) {
  const posts = await getSortedPosts()

  return rss({
    title: 'Graham Van Pelt',
    description: BLOG_DESCRIPTION,
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
