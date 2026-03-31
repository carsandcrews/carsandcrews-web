import { forwardRef, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-amber-500 text-black hover:bg-amber-400 active:bg-amber-600 focus-visible:ring-amber-500',
  secondary: 'bg-white/5 text-white hover:bg-white/10 active:bg-white/15 border border-white/10 focus-visible:ring-white/30',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10 focus-visible:ring-white/20'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center rounded-full px-5 py-2.5
          text-sm font-semibold transition-all duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a12]
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
