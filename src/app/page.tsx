import Link from 'next/link'
import { Face, FadeUp, SpanCycle } from './components'

export default function Home() {
  return (
    <FadeUp id="hero" delay="delay-150">
      <div className="px-6">
        <section className="flex flex-col items-center gap-8 text-skin-base hover:text-skin-base md:mb-16 md:flex-row md:justify-between">
          <p className="min-w-[320px] font-serif text-4xl font-semibold md:max-w-[20ch] md:text-5xl">
            A{' '}
            <span className="italic text-skin-accent">Software Developer</span>
            {', '}
            building for the web with <br />
            <SpanCycle />
          </p>
          <Face />
        </section>
        <section className="flex flex-col gap-16">
          <p className="prose-xl">
            👋 Hi, I&apos;m Graham, a web developer based on beautiful{' '}
            <span className="font-semibold not-italic">Salt Spring Island</span>{' '}
            in western Canada. For the past couple of years I've worked at{' '}
            <Link
              href="https://www.tipbox.io"
              aria-label="Go to my portfolio page."
              className="font-serif font-extrabold italic"
            >
              Tipbox.io
            </Link>{' '}
            as{' '}
            <span className="font-semibold not-italic">
              Full Stack Developer
            </span>
            . We're building a Task Management and Visual File Sharing platform
            for production teams.
            <br />
            <br />I use
            <span className="font-semibold not-italic">React</span> with{' '}
            <span className="font-semibold not-italic">TypeScript</span> to
            build satisfying and accessible web experiences. Visit my{' '}
            <Link
              href="portfolio"
              aria-label="Go to my portfolio page."
              className="font-serif italic underline"
            >
              portfolio
            </Link>{' '}
            or have a look through my{' '}
            <Link
              href="cv"
              aria-label="Go to my CV."
              className="font-serif italic underline"
            >
              CV
            </Link>
            .
          </p>
        </section>
      </div>
    </FadeUp>
  )
}
