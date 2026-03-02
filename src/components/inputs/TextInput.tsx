import { forwardRef } from 'react'
import { baseInputClass } from './inputStyles'

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`${baseInputClass} ${className}`}
        {...props}
      />
    )
  },
)

TextInput.displayName = 'TextInput'

export default TextInput
