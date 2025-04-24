import {
  CloudflareIcon,
  DigitalOceanIcon,
  NeonIcon,
  RQLiteIcon,
  StarbaseIcon,
  SupabaseIcon,
  TursoIcon,
  ValTownIcon,
} from '@/app/components/db-card/DBIcons'
import {
  BoardVisual,
  GeneralVisual,
  MySQLVisual,
  PostgresVisual,
  SQLiteVisual,
} from '@/app/components/db-card/DBVisuals'
import { colors, dbs, resources, statuses } from '@/app/components/db-card/page'
import { cn } from '@/app/utils/tw'
import {
  ChartBar,
  Circle,
  Database,
  DotsThreeVertical,
  Triangle,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { JSX } from 'react'

const getVisuals = (
  dbType: (typeof dbs)[number],
  resourceType: (typeof resources)[number],
) => {
  let icon = <Database weight="fill" size={20} /> // Default icon
  let visual: JSX.Element | null = <GeneralVisual /> // Default visual

  switch (resourceType) {
    case 'database':
      icon = <Database weight="fill" size={20} />
      break
    case 'board':
      icon = <ChartBar weight="fill" size={20} />
      break
    case 'Neon':
      icon = <NeonIcon />
      break
    case 'Turso':
      icon = <TursoIcon />
      break
    case 'Cloudflare':
      icon = <CloudflareIcon />
      break
    case 'RQLite':
      icon = <RQLiteIcon />
      break
    case 'DigitalOcean':
      icon = <DigitalOceanIcon />
      break
    case 'Supabase':
      icon = <SupabaseIcon />
      break
    case 'Val Town':
      icon = <ValTownIcon />
      break
    case 'Starbase':
      icon = <StarbaseIcon />
      break
    default:
      icon = <Database weight="fill" size={20} />
  }

  switch (dbType) {
    case 'Postgres':
      visual = <PostgresVisual />
      break
    case 'MySQL':
      visual = <MySQLVisual />
      break
    case 'SQLite':
      visual = <SQLiteVisual />
      break
    default:
      visual = <GeneralVisual />
  }

  if (resourceType === 'board') {
    visual = <BoardVisual />
  }

  return { icon, visual }
}

type DBCardProps = {
  className?: string
  color: (typeof colors)[number]
  db: (typeof dbs)[number]
  href: string
  resourceType: (typeof resources)[number]
  status?: (typeof statuses)[number]
  title?: string
}

const DBCard = ({
  className,
  color,
  db,
  href,
  resourceType,
  status,
  title,
}: DBCardProps) => {
  const { icon, visual } = getVisuals(db, resourceType)

  return (
    <Link
      href={href}
      className="group ob-btn btn-secondary ob-focus relative flex h-36 w-[302px] flex-col justify-between overflow-hidden rounded-lg p-3.5 transition-colors"
    >
      {/* content */}
      <header className="z-10 flex items-center gap-3">
        <div
          className={cn(
            'relative flex size-10 items-center justify-center rounded bg-linear-to-br transition-colors after:absolute after:size-full after:rounded after:border after:border-black/5 dark:after:border-white/10',
            {
              'from-neutral-200 to-neutral-50 dark:from-neutral-700 dark:to-neutral-700/0':
                color === 'default',

              'from-amber-500/20 to-orange-500/5 text-orange-500 dark:from-amber-800/50 dark:to-orange-800/10 dark:text-orange-300':
                color === 'orange',

              'from-green-500/20 to-teal-500/5 text-teal-500 dark:from-green-800/50 dark:to-teal-800/10 dark:text-emerald-300':
                color === 'green',

              'from-blue-500/20 to-indigo-500/5 text-blue-500 dark:from-blue-800/50 dark:to-indigo-800/10 dark:text-blue-300':
                color === 'blue',

              'from-fuchsia-500/30 via-teal-500/30 to-yellow-500/30 *:mix-blend-overlay dark:from-fuchsia-800/50 dark:via-teal-800/50 dark:to-yellow-800/50':
                color === 'rainbow',
            },
          )}
        >
          {icon}
        </div>

        <div className="text-base">
          <p className="text-ob-high-contrast font-semibold tracking-tight transition-colors">
            {title}
          </p>
          <p className="text-ob-medium-contrast font-medium transition-colors">
            {resourceType === 'board' ? 'Board' : db}
          </p>
        </div>
      </header>

      {/* status */}
      <div
        className={cn(
          'text-ob-low-contrast z-10 flex items-center gap-1.5 text-base',
          {
            'text-teal-700 dark:text-teal-600': status === 'hasViewers',
            'text-orange-700 dark:text-orange-600': status === 'disconnected',
          },
        )}
      >
        {status === 'hasViewers' ? (
          <Circle weight="fill" />
        ) : status === 'disconnected' ? (
          <Triangle weight="fill" />
        ) : null}
        <p>
          {status === 'default'
            ? 'Viewed 2d ago'
            : status === 'hasViewers'
              ? '2 viewers'
              : 'Connection lost'}
        </p>
      </div>

      {/* visual */}
      {visual}
      <div
        className={cn(
          'absolute right-0 bottom-0 z-[2] h-full w-1/2 bg-gradient-to-br mix-blend-hue',
          {
            'from-white to-white': color === 'default',
            'from-yellow-500 to-red-500': color === 'orange',
            'from-emerald-500 to-teal-500': color === 'green',
            'from-sky-500 to-indigo-500': color === 'blue',
            'from-fuchsia-500 via-sky-500 to-yellow-500': color === 'rainbow',
          },
          className,
        )}
      />

      {/* faux menu */}
      <button
        onClick={(e) => e.stopPropagation}
        className="ob-focus absolute top-2 right-2 z-10 flex size-8 cursor-pointer items-center justify-center rounded border border-neutral-200 bg-white opacity-0 group-hover:opacity-100 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        <DotsThreeVertical size={18} weight="bold" />
      </button>
    </Link>
  )
}

export default DBCard
