'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
// import { NavLink } from "@remix-run/react";
import React, { ReactNode, useEffect, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useAnimationControls,
  useReducedMotion,
} from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sig } from '@/app/components'

const sleep = (s: number) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000))

export default function SiteHeader() {
  const [showNav, setShowNav] = useState(false)
  const controls = useAnimationControls()
  const currentPath = usePathname()

  async function closeMenu() {
    await controls.start('closed')
    setShowNav(false)
    // here we are ensuring our menu animation finished before
    // dismissing the menu
  }

  useEffect(() => {
    if (showNav) {
      controls.start('open')
    }
  }, [controls, showNav])

  return (
    <header className="flex min-w-full justify-between p-6 transition-all md:py-12 lg:mb-8">
      <Link
        href="/"
        aria-label="Go back to the homepage"
        // prefetch="intent"
        className={currentPath === '/' ? 'stroke-skin-accent' : 'navLink'}
      >
        <Sig />
      </Link>

      <nav className="hidden gap-6 self-center font-sans text-2xl font-medium md:flex lg:gap-8">
        <Link
          href="cv"
          aria-label="Go to my CV."
          className={
            currentPath.startsWith('/cv') ? 'text-skin-accent' : 'navLink'
          }
        >
          CV
        </Link>
        <Link
          href="portfolio"
          aria-label="Go to the Portfolio page."
          className={
            currentPath === '/portfolio' ? 'text-skin-accent' : 'navLink'
          }
        >
          Portfolio
        </Link>
      </nav>
      <DropdownMenu.Root open={showNav} onOpenChange={setShowNav}>
        <DropdownMenu.Trigger className="rounded px-1.5 focus:bg-skin-fill-muted focus:outline-none md:hidden">
          {!showNav && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
          {showNav && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </DropdownMenu.Trigger>
        <AnimatePresence>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="items-left flex h-screen w-screen flex-col gap-16 bg-skin-fill px-6 py-24 font-sans text-2xl font-medium md:hidden"
              asChild
            >
              <motion.div
                initial="closed"
                animate={showNav ? 'open' : 'closed'}
                // exit="closed"
                variants={{
                  open: {
                    opacity: 1,
                    transition: { ease: 'easeOut', duration: 0.2 },
                  },
                  closed: {
                    opacity: 0,
                    transition: { ease: 'easeIn', duration: 0.3 },
                  },
                }}
              >
                {showNav && (
                  <>
                    <Link href="cv" className="max-w-max">
                      <Item closeMenu={closeMenu}>CV</Item>
                    </Link>
                    <Link href="portfolio" className="max-w-max">
                      <Item closeMenu={closeMenu}>Portfolio</Item>
                    </Link>
                  </>
                )}
              </motion.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </AnimatePresence>
      </DropdownMenu.Root>
    </header>
  )
}

function Item({
  children,
  onSelect = () => {},
  closeMenu,
}: {
  children?: ReactNode
  onSelect?: () => void
  closeMenu: () => void
}) {
  const controls = useAnimationControls()
  const shouldReduceMotion = useReducedMotion()
  return (
    <DropdownMenu.Item
      onSelect={async (e) => {
        e.preventDefault()
        if (!shouldReduceMotion) {
          await controls.start({
            backgroundColor: 'var(--colour-text-muted)',
            color: 'var(--colour-fill-muted)',
            transition: { duration: 0.1 },
          })
          await controls.start({
            backgroundColor: 'var(--colour-fill)',
            color: 'var(--colour-text-base)',
            transition: { duration: 0.3 },
          })
          await sleep(0.4)
        }

        await closeMenu()
        onSelect()
      }}
      asChild
      className="w-min select-none rounded px-2 py-1.5 text-skin-base data-[highlighted]:bg-skin-fill-muted data-[highlighted]:text-skin-base data-[highlighted]:focus:outline-none"
    >
      <motion.div animate={controls}>{children}</motion.div>
    </DropdownMenu.Item>
  )
}
