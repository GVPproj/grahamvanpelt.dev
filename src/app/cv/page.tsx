import { FadeUp } from '../components'

const Page = () => {
  return (
    <article className="mx-auto font-sans lg:prose-lg lg:mx-0">
      <FadeUp id="tipbox-experience">
        <>
          <h3>Software Developer @ Tipbox.io</h3>
          <h4>2023 - Present</h4>
          <ul>
            <li>
              building web ui for a collaborative platform targeting the film
              and tv industries
            </li>
            <li>
              create satisfying user interactions using React and ChakraUI
            </li>
            <li>
              update a postgres db and create graphql APIs with Prisma and
              Apollo
            </li>
            <li>animate interactions with Framer Motion</li>
            <li>
              work closely with the product design team to enhance UX, theming
              and consistency
            </li>
          </ul>
        </>
      </FadeUp>
      <FadeUp id="mythical-experience" delay="delay-200">
        <div>
          <h3>Web Developer / Audio Lead @ Mythical Voltage Games</h3>
          <h4>2020 - Present</h4>
          <ul>
            <li>
              crafting a company website with React, TailwindCSS, AstroJS and a
              headless CMS
            </li>
            <li>
              write C# scripts for music and audio events in the Unity game
              engine
            </li>
            <li>Git-based workflow with the development team</li>
            <li>manage the company email setup via Hostinger</li>
          </ul>
        </div>
      </FadeUp>
      <FadeUp id="freelance-experience">
        <div>
          <h3>Freelance Web Developer</h3>
          <h4>2020 - 2023</h4>
          <ul>
            <li>
              develop marketing and portfolio sites for entrepreneurs and small
              businesses
            </li>
            <li>
              produced a music festival page with AstroJS, React and TailwindCSS
            </li>
            <li>
              built a B&B marketing site using GatsbyJS, React and Styled
              Components
            </li>
            <li>
              crafted a Wordpress-based portfolio site for a game developer with
              custom post types, dynamic content, and responsive design
            </li>
            <li>
              Tooling includes ReactJS, Gatsby, Astro, Remix, TailwindCSS,
              Wordpress and Elementor
            </li>
          </ul>
        </div>
      </FadeUp>
      <FadeUp id="qualifications">
        <>
          <h2 className="font-serif italic">Qualifications</h2>
          <div>
            <ul>
              <li>
                Strong TypeScript, Graphql, HTML and CSS programming skills
              </li>
              <li>Extensive experience building with React</li>
              <li>
                Backend experience with a Postgres db using the Prisma ORM and
                Apollo Graphql
              </li>
              <li>C# coding experience</li>
              <li>Experience with Git workflows</li>
              <li>Adherance to WCAG Accessibility Standards</li>
              <li>NodeJS experience</li>
              <li>Skilled with the Command Line</li>
            </ul>
          </div>
        </>
      </FadeUp>
    </article>
  )
}

export default Page
