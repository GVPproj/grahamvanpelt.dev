---
title: "Migrating Remix loader data to a NextJs server component"
description: "The same PocketBase fetch written twice — once as a Remix v2 loader with useLoaderData, once as a Next 15 async server component — and what changes when data fetching moves into the component itself."
created: 2024-12-03T22:00:47.134Z
---

## Getting Pocketbase data into a component

### Pocketbase setup

We will fetch our posts from pocketbase.

```ts
// pocketbaseUtils.ts
import PocketBase from "pocketbase";

// next
const pb = new PocketBase(process.env.POCKETBASE_URL);

// remix
// const pb = new PocketBase(import.meta.env.VITE_PB_URL)

export const getPb = () => {
  return pb;
};
```

### The Remix v2 (vite) way

In Remix we export a loader that gets the `slug` url segment from its `params` object. We return the record from that function before calling it in the component via `useLoaderData`.

```tsx
// remix --> blog_.$slug.tsx

import { getPb } from "../data/pocketbaseUtils"
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export const loader: LoaderFunction = async ({
  params,
}: LoaderFunctionArgs) => {
  const pb = getPb()
  const record = await pb
    .collection("posts")
    .getFirstListItem(`slug="${params.slug}"`, {})
  return record
}

const Post = () => {
  const record = useLoaderData<typeof loader>()
  // ...
```

### The Next v15 RSC way

In a server component, we can make the `Post` itself an async function, which will depend on the `Params` promise resolving to get our `slug` url segment.

From there we can call the database directly and use its data in our markup, all in one go.

```tsx
// nextJs --> blog/[slug]/page.tsx
import React from 'react'
import { getPb } from '@/app/data/pocketbaseUtils'

type Params = Promise<{ slug: string[] }>

const Post = async ({ params }: { params: Params }) => {
  const { slug } = await params
  const pb = getPb()
  const record = await pb
    .collection('posts')
    .getFirstListItem(`slug="${slug}"`, {})

  return (
    // ... server component
    )
```

I've moved this site to Next 15 in part due to difficulties running animations in Remix v2, but I'm enjoying this RSC data loading pattern for simple reads from Pocketbase.
