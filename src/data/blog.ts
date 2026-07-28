import { getCollection } from 'astro:content'

export const BLOG_DESCRIPTION =
  'Notes on the things I build — Go, PocketBase, Remix and Next, Astro — written up while they are still fresh.'

// One format, three surfaces: the blog index, the post header and the OG card
// must always show the same date string.
export function formatPostDate(date: Date): string {
  return date.toLocaleDateString('en-CA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export async function getSortedPosts() {
  return (await getCollection('blog')).sort(
    (a, b) => b.data.created.getTime() - a.data.created.getTime(),
  )
}
