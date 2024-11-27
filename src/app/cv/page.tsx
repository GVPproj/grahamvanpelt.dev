// import Image from 'next/image'
import FadeIn from '../components/FadeIn'
// import Document from '../../../public/document.svg'

export default function Page() {
  // console.log(<Document />)
  return (
    <FadeIn>
      <section className="flex flex-col justify-between gap-12 lg:flex-row">
        <aside className="mx-auto flex flex-col font-sans lg:mx-0 lg:w-1/4">
          {/* <img
            className="mx-auto my-0 aspect-square h-36 w-36 overflow-hidden rounded-full bg-skin-accent p-1 lg:mx-0"
            height="auto"
            loading="eager"
            width="auto"
            src="/images/graham.webp"
            alt="My face smiling"
          ></img> */}
          <p>
            A front-end web developer who loves{' '}
            <span className="font-bold">React</span>. A game developer
            specializing in <span className="font-bold">Audio.</span> A{' '}
            <span className="font-bold">Music-Lover</span> who releases albums
            and broadcasts a weekly radio show online.
          </p>
          <a download="" href="/resume/GrahamVanPelt_CV.pdf">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                <path d="M9 9l1 0"></path>
                <path d="M9 13l6 0"></path>
                <path d="M9 17l6 0"></path>
              </svg>
              <p className="m-0 text-base">My CV .pdf</p>
            </div>
          </a>

          {/* <Link
            to="mailto:grahamvanpelt@gmail.com"
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
            to="https://github.com/GVPproj"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center gap-2">
              <Github />
              <p className="m-0 text-base">GitHub Profile</p>
            </div>
          </Link>
          <Link
            to="https://www.linkedin.com/in/graham-van-pelt-39b37797/"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center gap-2">
              <LinkedIn />
              <p className="m-0 text-base">LinkedIn Profile</p>
            </div>
          </Link>
          <Link
            to="https://links.grahamvanpelt.com/"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center gap-2">
              <Music />
              <p className="m-0 text-base">Music Page</p>
            </div>
          </Link> */}
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
