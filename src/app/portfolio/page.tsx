import React from 'react'
import Image from 'next/image'
import { PortfolioItem, FadeIn, FadeUp } from '../components'
import { portfolioItems } from '../data/portfolioData'
import { laptopMobileMockup } from '@/images/Ben_TB_Assets'

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
        <>
          <h1 className="text-2xl font-extrabold md:text-4xl">
            <span>Tipbox.io</span>
          </h1>
          <Image
            src={laptopMobileMockup}
            alt="Tipbox.io laptop and mobile mockup"
            className="mb-8 w-full"
          />
        </>
      </FadeIn>
      <FadeUp id="client">
        <h1 className="text-2xl font-extrabold md:text-4xl">
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
