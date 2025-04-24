'use client'

import useTheme from '@/app/hooks/useTheme'
import { cn } from '@/app/utils/tw'
import { Moon, Sun } from '@phosphor-icons/react'
import { useState } from 'react'

// type ThemeSelectorProps = {
//   onClick: () => void
//   theme: 'light' | 'dark'
// }

const ThemeSelector = () =>
  // { onClick, theme }: ThemeSelectorProps
  {
    const [theme, setTheme] = useState<'dark' | 'light'>('light')

    useTheme(theme)

    const toggleTheme = () => {
      setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
    }

    return (
      <button
        className="flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-900"
        onClick={() => toggleTheme()}
      >
        <Moon
          weight="bold"
          className={cn('hidden', {
            'animate-fade block': theme === 'dark',
          })}
        />
        <Sun
          weight="bold"
          className={cn('animate-fade block', {
            hidden: theme === 'dark',
          })}
        />
      </button>
    )
  }

export default ThemeSelector
