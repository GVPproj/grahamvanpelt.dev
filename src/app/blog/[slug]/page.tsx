import ClickPre from '@/app/components/ClickPre'
import { getPb } from '@/app/data/pocketbaseUtils'
import Markdown from 'markdown-to-jsx'
import React from 'react'

type Params = Promise<{ slug: string[] }>

const Post = async ({ params }: { params: Params }) => {
  const { slug } = await params
  const pb = getPb()
  const record = await pb
    .collection('markdownPosts')
    .getFirstListItem(`slug="${slug}"`, {})

  return (
    <article className="mx-auto flex flex-col px-6">
      <div className="prose mx-auto">
        <h1 className="mb-0 text-4xl font-bold text-skin-accent">
          {record.title}
        </h1>
        <h2 className="mt-4 text-lg font-semibold text-skin-accent">
          {new Date(record.created).toLocaleDateString('en-CA', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </h2>
      </div>
      <div className="prose mx-auto max-w-full text-skin-base prose-headings:text-skin-base prose-h1:text-skin-accent prose-a:text-skin-accent prose-a:no-underline prose-strong:text-skin-base prose-code:bg-skin-fill-muted prose-code:text-skin-base prose-code:before:content-none prose-code:after:content-none prose-pre:bg-skin-fill-muted">
        <Markdown
          options={{
            overrides: {
              pre: ClickPre,
            },
          }}
        >
          {record.markdown}
        </Markdown>
      </div>
    </article>
  )
}

export default Post
