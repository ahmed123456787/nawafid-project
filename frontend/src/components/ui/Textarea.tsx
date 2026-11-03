import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import Label from './Label'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string | null
  hint?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, id, className, ...rest }, ref) {
    const autoId = useId()
    const textareaId = id ?? autoId

    return (
      <div className="w-full">
        {label && <Label htmlFor={textareaId}>{label}</Label>}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            className,
          )}
          {...rest}
        />
        {error ? (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    )
  },
)

export default Textarea
