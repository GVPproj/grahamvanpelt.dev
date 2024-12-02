import Link from 'next/link'
import { getPb } from '../data/pocketbaseUtils'

const Blog = async () => {
  const pb = getPb()
  const { items: posts } = await pb.collection('markdownPosts').getList(1, 50, {
    filter: 'created >= "2022-01-01 00:00:00"',
    fields: 'id, title, slug, created',
  })

  return (
    <section className="flex flex-col gap-4">
      <>
        {posts.map((post) => {
          return (
            <Link href={`/blog/${post.slug}`} key={post.id}>
              <h2 className="text-xl font-bold">{post.title}</h2>
              <h2 className="text-base font-semibold">
                {new Date(post.created).toLocaleDateString('en-CA', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h2>
            </Link>
          )
        })}
      </>
    </section>
  )
}
export default Blog
