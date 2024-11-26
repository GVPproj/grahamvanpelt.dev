import { Link } from "@remix-run/react"
import Laptop from "./Laptop"
import Astro from "../assets/astro.svg?react"
import Gatsby from "../assets/gatsby.svg?react"
import Javascript from "../assets/javascript.svg?react"
import React from "../assets/react.svg?react"
import TailwindCSS from "../assets/tailwind.svg?react"
import TypeScript from "../assets/typescript.svg?react"
import CSS from "../assets/css.svg?react"
import Github from "../assets/github.svg?react"

interface Props {
  title?: string
  url?: string
  screenshot?: string
  description?: string
  tooling: string[]
  repo?: string
}

export default function PortfolioItem(props: Props) {
  return (
    <>
      <div className="my-24 md:my-36">
        <div className="flex flex-col gap-12 xl:flex-row">
          <div className="min-w-max">
            {props.url ? (
              <Link to={props.url} target="_blank" rel="noreferrer">
                <Laptop
                  src={props.screenshot}
                  alt={"Visit this project: " + props.title}
                />
              </Link>
            ) : (
              <Laptop
                src={props.screenshot}
                alt={"Screenshot of project: " + props.title}
                title={"No link available for project: " + props.title}
              />
            )}
          </div>
          <div className="flex flex-col justify-evenly gap-12 sm:flex-row">
            <div id="ToolingList" className="text-skin-muted md:min-w-max">
              {props.repo && (
                <Link to={props.repo} target="_blank" rel="noreferrer">
                  <div className="flex items-center gap-4">
                    <Github />
                    <p className="font-sans text-xl font-semibold">
                      GitHub Repo
                    </p>
                  </div>
                </Link>
              )}
              {props.tooling.includes("Gatsby") && (
                <div className="flex items-center gap-4">
                  <Gatsby />
                  <span className="font-sans text-xl not-italic ">Gatsby</span>
                </div>
              )}

              {props.tooling.includes("Astro") && (
                <div className="flex items-center gap-4">
                  <Astro />

                  <span className="font-sans text-xl not-italic">Astro</span>
                </div>
              )}
              {props.tooling.includes("TypeScript") && (
                <div className="flex items-center gap-4">
                  <TypeScript />

                  <span className="font-sans text-xl not-italic">
                    TypeScript
                  </span>
                </div>
              )}
              {props.tooling.includes("React") && (
                <div className="flex items-center gap-4">
                  <React />

                  <span className="font-sans text-xl not-italic">React</span>
                </div>
              )}
              {props.tooling.includes("HTML") && (
                <div className="flex items-center gap-4">
                  <Gatsby />
                  <span className="font-sans text-xl not-italic">HTML</span>
                </div>
              )}
              {props.tooling.includes("TailwindCSS") && (
                <div className="flex items-center gap-4">
                  <TailwindCSS />

                  <span className="font-sans text-xl not-italic">
                    TailwindCSS
                  </span>
                </div>
              )}
              {props.tooling.includes("Javascript") && (
                <div className="flex items-center gap-4">
                  <Javascript />

                  <span className="font-sans text-xl not-italic">
                    Javascript
                  </span>
                </div>
              )}

              {props.tooling.includes("CSS") && (
                <div className="flex items-center gap-4">
                  <CSS />

                  <span className="font-sans text-xl not-italic">CSS</span>
                </div>
              )}
            </div>
            <div className="prose md:min-w-[300px]">
              <Link
                to={props.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="font-sans text-xl font-semibold text-skin-accent no-underline"
              >
                {props.title}
              </Link>
              <p className="prose text-skin-muted">{props.description}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
