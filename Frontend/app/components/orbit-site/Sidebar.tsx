'use client'

import { sitemap } from '@/app/lib/sitemap'
import { cn } from '@/app/utils/tw'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const slugify = (link: string) => {
  const result = link.replace(/\s+/g, '-').toLowerCase()

  return result
}

const Sidebar = () => {
  const currentPage = usePathname()

  return (
    <section className="border-r border-neutral-200 transition-colors dark:border-neutral-800">
      <div className="sticky top-[49px] w-56 px-3 pt-6">
        {sitemap.map((category, index) => (
          <ul className="w-full" key={index}>
            <li className="mb-3 ml-3 text-sm font-semibold text-neutral-700 transition-colors dark:text-neutral-400">
              {category.title}
            </li>

            {category.items.map((item, index) => {
              const itemLink =
                '/' + slugify(category.title) + '/' + slugify(item.title)
              return (
                <li className="w-full last-of-type:mb-4" key={index}>
                  <Link
                    className={cn(
                      'text-ob-base-300 block w-full rounded px-3 py-2 text-base transition-colors hover:bg-neutral-200/60 dark:hover:bg-neutral-900',
                      {
                        'bg-neutral-200/60 font-medium dark:bg-neutral-900':
                          currentPage === itemLink,
                      },
                    )}
                    href={itemLink}
                  >
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        ))}
      </div>
    </section>
  )
}

export default Sidebar
