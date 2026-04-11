import { forwardRef, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent)]',
  secondary:
    'bg-transparent text-[var(--text)] border border-[var(--border-strong)] hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)] focus-visible:ring-[var(--border-strong)]',
  ghost:
    'bg-transparent text-[var(--text-muted)] hover:text-[var(--accent)] active:text-[var(--accent-hover)] focus-visible:ring-[var(--accent)] px-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, disabled, className = '', children, ...props }, ref) => {
    const isGhost = variant === 'ghost'
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          display inline-flex items-center justify-center
          ${isGhost ? '' : 'h-11 px-6'}
          uppercase tracking-[0.1em] text-[15px]
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]
          disabled:opacity-50 disabled:pointer-events-none
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
