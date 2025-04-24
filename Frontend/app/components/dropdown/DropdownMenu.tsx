import { DotsThree, IconContext } from '@phosphor-icons/react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import Link, { LinkProps } from 'next/link'

// import Checkbox from 'ob/components/stardust/Input/Checkbox'
import { cn } from '@/app/utils/tw'

export type MenuItemProps = {
  destructiveAction?: boolean
  href?: LinkProps['href']
  hrefExternal?: boolean
  icon?: React.ReactNode
  label?: string | React.ReactNode
  checked?: boolean
  onClick?: (event: any) => void
  titleContent?: React.ReactNode
  type: 'button' | 'link' | 'divider' | 'title' | 'checkbox' | string
}

export type DropdownMenuProps = {
  align: 'center' | 'end' | 'start'
  alignOffset?: number
//   buttonProps?: React.ComponentProps<typeof buttonVariants>
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  MenuItems: Array<MenuItemProps> | null
  onCloseRmFocus?: boolean
  side: 'bottom' | 'left' | 'right' | 'top'
  sideOffset?: number
  size?: 'sm' | 'base'
  id?: string
}

const DropdownMenu = ({
  align,
  alignOffset,
  // buttonProps,
  // children,
  className,
  disabled,
  MenuItems,
  onCloseRmFocus = true,
  side,
  sideOffset,
  id,
  size = 'base',
}: DropdownMenuProps) => (
  <DropdownMenuPrimitive.Root>
    <DropdownMenuPrimitive.Trigger
      id={id}
      className={cn(
        children
          ? 'radix-state-open:!text-neutral-950 dark:radix-state-open:!text-white text-neutral-500 focus-visible:opacity-100 dark:text-neutral-400'
          : buttonVariants(
              buttonProps ?? {
                variant: 'ghost',
                size: 'base',
                shape: 'square',
                interaction: 'none',
                class:
                  'radix-state-open:text-neutral-950 dark:radix-state-open:text-white focus-visible:opacity-100',
              },
            ),
        className,
      )}
      disabled={disabled}
    >
      {children ?? <DotsThree weight="bold" />}
    </DropdownMenuPrimitive.Trigger>
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={align ?? 'start'}
        sideOffset={sideOffset ?? 0}
        alignOffset={alignOffset ?? 0}
        side={side ?? 'bottom'}
        onCloseAutoFocus={(e) => {
          onCloseRmFocus ? e.preventDefault() : null
        }}
        className={cn(
          'z-modal radix-state-closed:animate-scaleFadeOutSm radix-state-open:animate-scaleFadeInSm overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 py-1.5 text-base font-medium text-neutral-900 shadow-lg shadow-black/5 transition-transform duration-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white',
          {
            'origin-top-right': align === 'end' && side === 'bottom',
            'origin-top-left': align === 'start' && side === 'bottom',
            'origin-bottom-right': align === 'end' && side === 'top',
            'origin-bottom-left': align === 'start' && side === 'top',
            'text-sm font-normal': size === 'sm',
          },
        )}
      >
        {MenuItems?.map((item, index) => {
          if (item.type === 'title') {
            return (
              <header
                className="px-2.5 py-2.5 dark:border-neutral-800"
                onClick={(e) => e.preventDefault()}
                key={index}
              >
                {item.titleContent}
              </header>
            )
          } else if (item.type === 'divider') {
            return (
              <div className="my-1.5 w-full px-2.5" key={index}>
                <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
            )
          } else if (item.type === 'link' || item.type === 'button') {
            return (
              <DropdownMenuPrimitive.Item asChild key={index}>
                {item.type === 'link' ? (
                  <Link
                    className="radix-highlighted:bg-neutral-100 radix-highlighted:text-neutral-950 dark:radix-highlighted:bg-neutral-800 dark:radix-highlighted:text-white flex w-full items-center justify-between gap-5 rounded-md p-2.5 text-neutral-700 focus:outline-none dark:text-neutral-300"
                    href={item.href || ''}
                    target={item.hrefExternal ? '_blank' : undefined}
                  >
                    {item.label}
                    <IconContext.Provider
                      value={{
                        size: size === 'sm' ? 16 : 20,
                      }}
                    >
                      {item.icon}
                    </IconContext.Provider>
                  </Link>
                ) : (
                  <button
                    onClick={item.onClick}
                    className={cn(
                      'radix-highlighted:bg-neutral-100 radix-highlighted:text-neutral-950 dark:radix-highlighted:bg-neutral-800 dark:radix-highlighted:text-white flex w-full items-center justify-between gap-5 rounded-md p-2.5 text-neutral-700 focus:outline-none dark:text-neutral-300',
                      {
                        'radix-highlighted:bg-red-50 radix-highlighted:text-red-600 dark:radix-highlighted:bg-red-500/10 dark:radix-highlighted:text-red-400 text-red-500 dark:text-red-400/90':
                          item.destructiveAction,
                      },
                    )}
                  >
                    {item.label}
                    <IconContext.Provider
                      value={{
                        size: size === 'sm' ? 16 : 20,
                      }}
                    >
                      {item.icon}
                    </IconContext.Provider>
                  </button>
                )}
              </DropdownMenuPrimitive.Item>
            )
          } else if (item.type === 'checkbox') {
            return (
              <DropdownMenuPrimitive.Item asChild key={index}>
                <label className="radix-highlighted:bg-neutral-100 radix-highlighted:text-neutral-950 dark:radix-highlighted:bg-neutral-800 dark:radix-highlighted:text-white flex w-full items-center gap-2 rounded-md p-2 text-neutral-700 focus:outline-none dark:text-neutral-300">
                  <Checkbox
                    checked={item.checked}
                    onValueChange={() => {
                      item.onClick?.(item.label)
                    }}
                  />
                  <span>{item.label}</span>
                </label>
              </DropdownMenuPrimitive.Item>
            )
          }
        })}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  </DropdownMenuPrimitive.Root>
)

DropdownMenu.displayName = 'DropdownMenu'

export { DropdownMenu }
