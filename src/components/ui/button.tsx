import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  accent:  'bg-brand text-white hover:opacity-90',
  ghost:   'hover:bg-secondary text-foreground',
  outline: 'border border-border bg-transparent hover:bg-secondary text-foreground',
  danger:  'bg-destructive text-white hover:bg-destructive/90',
}

const sizes = {
  sm: 'h-7 px-3 text-xs rounded-md',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1',
          'active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
