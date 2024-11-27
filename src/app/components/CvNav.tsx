'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CvNav = () => {
  const currentPath = usePathname()

  return (
    <nav className="flex gap-8 font-sans text-xl">
      <Link
        // preventScrollReset
        href={currentPath === '/cv' ? '/cv' : '.'}
        // replace
        // end
        // className={({ isActive }) =>
        //   isActive
        //     ? 'text-skin-accent no-underline'
        //     : 'text-skin-base no-underline'
        // }
      >
        Experience
      </Link>
      <Link
        href={currentPath === '/cv/education' ? 'education' : 'cv/education'}

        // href="cv/education"
        // end
        // preventScrollReset
        // className={({ isActive }) =>
        //   isActive
        //     ? 'text-skin-accent no-underline'
        //     : 'text-skin-base no-underline'
        // }
      >
        Education
      </Link>
    </nav>
  )
}

export default CvNav
