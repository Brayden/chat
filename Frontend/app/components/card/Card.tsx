import { cn } from '@/app/utils/tw'

type CardProps = {
  as?: React.ElementType
  children?: React.ReactNode
  className?: string
  ref?: React.Ref<HTMLElement>
  tabIndex?: number
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
}

export const Card = ({
  as,
  children,
  className,
  ref,
  tabIndex,
  variant = 'secondary',
}: CardProps) => {
  const Component = as ?? 'div'
  return (
    <Component
      className={cn(
        'll-btn w-full rounded-lg p-4',
        {
          'btn-primary': variant === 'primary',
          'btn-secondary': variant === 'secondary',
        },
        className,
      )}
      ref={ref}
      tabIndex={tabIndex}
    >
      {children}
    </Component>
  )
}
