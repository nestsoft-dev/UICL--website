import { forwardRef } from 'react'
import { baseInputClass } from './inputStyles'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`${baseInputClass} min-h-[96px] ${className}`}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'

export default Textarea
