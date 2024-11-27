import React from 'react'
import { PortfolioItem, FadeIn, FadeUp } from '../components'
import { portfolioItems } from '../data/portfolioData'

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
  const projects = portfolioItems.filter((item) => item.category === 'project')
  const education = portfolioItems.filter(
    (item) => item.category === 'education',
  )

  return (
    <>
      <FadeIn>
        <>
          <h1 className="mb-8 text-2xl font-extrabold md:text-4xl">
            <span>Collaborative Projects</span>
          </h1>
          <p>Team-driven projects featuring my work.</p>
        </>
      </FadeIn>
      {projects.map((item, index) => (
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
            {index < projects.length - 1 && <PortfolioDivider />}
          </>
        </FadeUp>
      ))}
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
      <FadeUp id="educational">
        <>
          <h1 className="mb-8 text-2xl font-extrabold md:text-4xl">
            <span>Educational Projects</span>
          </h1>
          <p>
            These projects were coded by <span>me</span>, assigned as Figma
            files and functionality descriptions.
          </p>
        </>
      </FadeUp>
      {education.map((item, index) => (
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
            {index !== education.length - 1 && <PortfolioDivider />}
          </>
        </FadeUp>
      ))}
    </>
  )
}

export default Portfolio
