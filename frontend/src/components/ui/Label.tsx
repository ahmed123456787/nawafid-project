import type { LabelHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export default function Label({
  className,
  children,
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'mb-1 block text-sm font-medium text-slate-700',
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  )
}
