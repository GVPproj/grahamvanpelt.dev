import { Certificate } from '@/app/components'
import FadeIn from '@/app/components/FadeIn'
import Link from 'next/link'

const Page = () => {
  return (
    <FadeIn>
      <article className="mx-auto mt-8 font-sans lg:prose-lg lg:mx-0">
        <h3>
          <Link
            href="https://scrimba.com/learn/frontend"
            // target="_blank"
            // rel="noreferrer"
            className="no-underline"
          >
            Scrimba Frontend Career Path
          </Link>
        </h3>

        <h4>
          2022 - 2023{' '}
          <span className="font-light">(Click certificate to celebrate!)</span>
        </h4>

        <Certificate
          src="/images/scrim-cert.webp"
          alt="Graham Van Pelt's Scrimba Graduation Certificate"
        />
      </article>
    </FadeIn>
  )
}

export default Page
