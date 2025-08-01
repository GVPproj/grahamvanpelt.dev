import React from 'react'
import Image from 'next/image'
import { PortfolioItem, FadeIn, FadeUp } from '../components'
import { TipboxLogo } from '../components/icons'
import { portfolioItems } from '../data/portfolioData'
import Link from 'next/link'

const benFreySample = '/images/tipbox/Ben Frey sample - Tipbox.jpg'
const laptop = '/images/tipbox/Laptop.png'

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
              out of visual file sharing, task tracking, and project management.
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
      <Image
        src={benFreySample}
        alt="Tipbox.io laptop and mobile mockup"
        width={1200}
        height={600}
        className="full-bleed my-16"
      />
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
