import Link from "next/link"
import Face from "./components/Face"
import FadeUp from "./components/FadeUp"
import SpanCycle from "./components/SpanCycle"

export default function Home() {
  return (
    <FadeUp id="hero" delay="delay-150">
      <>
        <section className="mb-16 flex flex-col items-center gap-8 text-skin-base hover:text-skin-base md:flex-row md:justify-between">
          <p className="min-w-[320px] font-serif text-4xl font-semibold md:max-w-[20ch] md:text-5xl">
            A{" "}
            <span className="italic text-skin-accent">Software Developer</span>
            {", "}
            building for the web with <br />
            <SpanCycle />.
          </p>
          <Face />
        </section>
        <section className="flex flex-col gap-16">
          <p className="prose-xl">
            👋 Hi, I&apos;m Graham, a web developer based on beautiful{" "}
            <span className="font-semibold not-italic">Salt Spring Island</span>{" "}
            in western Canada. I use{" "}
            <span className="font-semibold not-italic">React</span> with{" "}
            <span className="font-semibold not-italic">TypeScript</span> to
            build satisfying and accessible web experiences. Visit my{" "}
            <Link
              href="portfolio"
              aria-label="Go to my portfolio page."
              className="font-serif italic underline"
            >
              portfolio
            </Link>{" "}
            or have a look through my{" "}
            <Link
              // prefetch="render"
              href="cv"
              aria-label="Go to my CV."
              className="font-serif italic underline"
            >
              CV
            </Link>
            .
          </p>
        </section>
      </>
    </FadeUp>
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    //   <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
    //     <Face />
    //   </main>
    // </div>
  )
}
