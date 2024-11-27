// import Image from 'next/image'
import Image from 'next/image'
import { DocIcon, Music, Github, Email, LinkedIn } from '../components'
import FadeIn from '../components/FadeIn'
import Link from 'next/link'

export default function Page() {
  return (
    // <Document />
    <FadeIn>
      <section className="flex flex-col justify-between gap-12 lg:flex-row">
        <aside className="mx-auto flex flex-col font-sans lg:mx-0 lg:w-1/4">
          <Image
            className="mx-auto my-0 aspect-square h-36 w-36 overflow-hidden rounded-full bg-skin-accent p-1 lg:mx-0"
            height={144} // Optional, but recommended for performance
            width={144} // Optional, but recommended for performance
            src="/images/graham.webp"
            alt="My face smiling"
          />
          <p>
            A front-end web developer who loves{' '}
            <span className="font-bold">React</span>. A game developer
            specializing in <span className="font-bold">Audio.</span> A{' '}
            <span className="font-bold">Music-Lover</span> who releases albums
            and broadcasts a weekly radio show online.
          </p>
          <a download="" href="/resume/GrahamVanPelt_CV.pdf">
            <div className="flex items-center gap-2">
              <DocIcon />
              <p className="m-0 text-base">My CV .pdf</p>
            </div>
          </a>

          <Link
            href="mailto:grahamvanpelt@gmail.com"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center gap-2">
              <div className="inline p-0">
                <Email />
              </div>
              <p className="m-0 text-base">Email</p>
            </div>
          </Link>

          <Link
            href="https://github.com/GVPproj"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center gap-2">
              <Github />
              <p className="m-0 text-base">GitHub Profile</p>
            </div>
          </Link>

          <Link
            href="https://www.linkedin.com/in/graham-van-pelt-39b37797/"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center gap-2">
              <LinkedIn />
              <p className="m-0 text-base">LinkedIn Profile</p>
            </div>
          </Link>

          <Link
            href="https://links.grahamvanpelt.com/"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center gap-2">
              <Music />
              <p className="m-0 text-base">Music Page</p>
            </div>
          </Link>
        </aside>
        <section className="mt-8 md:mt-0">
          <nav className="flex gap-8 font-sans text-xl">
            {/* <NavLink
              preventScrollReset
              to="."
              end
              className={({ isActive }) =>
                isActive
                  ? 'text-skin-accent no-underline'
                  : 'text-skin-base no-underline'
              }
            >
              Experience
            </NavLink>
            <NavLink
              to="./education"
              end
              preventScrollReset
              className={({ isActive }) =>
                isActive
                  ? 'text-skin-accent no-underline'
                  : 'text-skin-base no-underline'
              }
            >
              Education
            </NavLink> */}
          </nav>

          {/* <Slot /> */}
        </section>
      </section>
    </FadeIn>
  )
}
