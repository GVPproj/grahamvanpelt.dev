import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // Required, not optional: it feeds the meta description, the OG card and
    // the RSS item. Optional would let a post ship with all three degraded
    // and the build still go green.
    description: z.string(),
    created: z.coerce.date(),
  }),
})

export const collections = { blog }
