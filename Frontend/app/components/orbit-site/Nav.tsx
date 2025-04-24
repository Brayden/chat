'use client'

import ThemeSelector from '@/app/components/orbit-site/ThemeSelector'
import Link from 'next/link'

const Nav = () => {
  return (
    <div className="sticky top-0 z-50 flex w-full border-b border-neutral-200 bg-neutral-50 py-2 pr-2 pl-6 transition-colors dark:border-neutral-800 dark:bg-neutral-950">
      <nav className="flex w-full justify-between">
        <Link href={'/'} className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-neutral-300 transition-colors dark:bg-neutral-500" />
          <p className="text-ob-base-300 font-semibold transition-colors">
            Orbit
          </p>
        </Link>
        <ThemeSelector />
      </nav>
    </div>
  )
}

export default Nav
