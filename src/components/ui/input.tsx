import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-white/80">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5
            text-white placeholder:text-white/30
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50
            hover:border-white/20
            ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'
