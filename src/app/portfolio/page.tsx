import React from 'react'
import Image from 'next/image'
import { PortfolioItem, FadeIn, FadeUp } from '../components'
import { TipboxLogo } from '../components/icons'
import { portfolioItems } from '../data/portfolioData'
import Link from 'next/link'

const benFreySample = '/images/tipbox/Ben Frey sample - Tipbox.jpg'
const laptop = '/images/tipbox/Laptop.png'
// const laptopMobileMockup = '/images/tipbox/Laptop-+-Mobile-mockup.png'
const noLookingBack = '/images/tipbox/No Looking Back.png'
// const noFlashyChaos = '/images/tipbox/No-Flashy-Chaos.png'
// const noLookingBackAlt = '/images/tipbox/No-Looking-Back.png'
const laptopSlideshow = '/images/tipbox/_Laptop-slideshow-2.gif'

export const metadata = {
  title: 'Graham Van Pelt - Portfolio',
  description: 'A list of my web personal with links and descriptions.',
  openGraph: {
    title: 'Graham Van Pelt - Portfolio',
    description: 'A list of my web personal with links and descriptions.',
    url: 'https://grahamvanpelt.dev/portfolio',
  },
}

const PortfolioDivider = () => {
  return (
    <hr className="mx-auto my-4 h-1 w-48 rounded border-0 bg-skin-fill-muted md:my-10"></hr>
  )
}

const Portfolio = () => {
  const personal = portfolioItems.filter((item) => item.category === 'personal')

  return (
    <>
      <FadeIn>
        <div className="flex w-full flex-col items-center justify-between gap-8 px-6 md:flex-row md:gap-0">
          <div className="flex w-full flex-col gap-12">
            <Link
              href="https://www.tipbox.io"
              aria-label="Go to Tipbox.io"
              className="inline-block text-skin-base transition-colors duration-200 hover:text-skin-highlight"
            >
              <TipboxLogo className="h-12 w-auto" />
            </Link>
            <p className="max-w-[40ch]">
              Your production team&apos;s best friend – take all the headaches
              out of file sharing, task tracking, workflows and project
              management.
            </p>
          </div>
          <Image
            src={laptop}
            alt="Tipbox.io laptop and mobile mockup"
            width={500}
            height={300}
            className="w-full md:w-[500px]"
          />
        </div>
      </FadeIn>
      <FadeIn>
        <>
          <div className="my-12 flex w-full flex-col justify-between gap-8 lg:flex-row">
            <article className="flex w-full flex-col gap-4 px-6">
              <h3 className="text-2xl text-skin-base">My Role</h3>
              <p>
                As a Full-Stack Engineer and Product Experience Lead at Tipbox,
                I architected and delivered end-to-end solutions for a
                collaborative document and tasks platform. My hundreds of
                commits span the frontend and backend, encompassing an entire
                task management ecosystem—from GraphQL schema design to React
                component implementation. I&apos;ve owned database optimization,
                API development, UI state management, and UX design, leading
                architectural decisions and enhancing authentication flows.
                Bridging product vision with technical execution, I deliver
                complex features, integrating AWS, PostgreSQL, and
                React/TypeScript for robust performance and exceptional user
                experience.
              </p>
            </article>
            <Image
              src={noLookingBack}
              width={600}
              height={438}
              alt="No looking back"
              className="my-auto h-full w-auto object-contain"
            />
          </div>

          <h3 className="pl-6 text-2xl font-semibold text-skin-base">Team</h3>
          <div className="mb-12 flex w-full flex-col justify-between gap-8 pr-6 lg:flex-row lg:pl-6 lg:pr-0">
            <Image
              src={laptopSlideshow}
              width={400}
              height={238}
              alt="No looking back"
              className="ml-6 mt-8 h-full w-full self-center rounded-lg object-contain lg:mb-0 lg:ml-0"
            />
            <article className="flex w-full flex-col gap-4 px-0 lg:px-6">
              <ul className="w-full min-w-max list-none text-lg lg:text-right">
                {' '}
                <li className="border-skin-fill-muted border-b pb-2">
                  <span className="font-semibold not-italic">
                    Graham Van Pelt
                  </span>
                  , Full-Stack Engineer
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/in/howie-baral-9550aa4/"
                    className="font-semibold not-italic text-skin-accent transition-colors duration-200 hover:text-skin-highlight"
                  >
                    Howard Baral
                  </Link>
                  , Founder & Chief Executive Officer
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/in/michaelschlein/"
                    className="font-semibold not-italic text-skin-accent transition-colors duration-200 hover:text-skin-highlight"
                  >
                    Michael Schlein
                  </Link>
                  , Chief Product Officer
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/in/giovangonzalez/"
                    className="font-semibold not-italic text-skin-accent transition-colors duration-200 hover:text-skin-highlight"
                  >
                    Milton Gonzalez
                  </Link>
                  , Chief Technical Officer
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/in/ben-frey-88186a65/"
                    className="font-semibold not-italic text-skin-accent transition-colors duration-200 hover:text-skin-highlight"
                  >
                    Ben Frey
                  </Link>
                  , Creative Director & Senior Product Designer
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/in/jeffrey-stefani-85563a221/"
                    className="font-semibold not-italic text-skin-accent transition-colors duration-200 hover:text-skin-highlight"
                  >
                    Jeffery Stefani
                  </Link>
                  , Creative Director
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/in/jonny-nguyen/"
                    className="font-semibold not-italic text-skin-accent transition-colors duration-200 hover:text-skin-highlight"
                  >
                    Jonny Nguyen
                  </Link>
                  , Full-stack, DevOps Engineer
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/in/dionkodhyat/"
                    className="font-semibold not-italic text-skin-accent transition-colors duration-200 hover:text-skin-highlight"
                  >
                    Dion Kodhyat
                  </Link>
                  , Front-End Developer
                </li>
              </ul>
            </article>
          </div>
        </>
      </FadeIn>{' '}
      <Image
        src={benFreySample}
        alt="Tipbox.io laptop and mobile mockup"
        width={1200}
        height={600}
        className="full-bleed my-16"
      />{' '}
      <PortfolioDivider />
      <FadeUp id="client">
        <h1 className="mt-12 pl-6 text-2xl font-extrabold md:text-4xl">
          <span>Client websites</span> and <span>personal projects</span>
        </h1>
      </FadeUp>
      {personal.map((item, index) => (
        <FadeUp key={item.title} id={item.title}>
          <>
            <PortfolioItem
              title={item.title}
              description={item.description}
              screenshot={item.screenshot}
              tooling={item.tooling}
              url={item.url}
              repo={item.repo}
            />
            {index < personal.length - 1 && <PortfolioDivider />}
          </>
        </FadeUp>
      ))}
    </>
  )
}

export default Portfolio
