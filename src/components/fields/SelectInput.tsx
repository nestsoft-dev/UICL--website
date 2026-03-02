import { forwardRef } from 'react'
import { baseInputClass } from './inputStyles'

type SelectInputProps = React.SelectHTMLAttributes<HTMLSelectElement>

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`${baseInputClass} ${className}`}
        {...props}
      >
        {children}
      </select>
    )
  },
)

SelectInput.displayName = 'SelectInput'

export default SelectInput
