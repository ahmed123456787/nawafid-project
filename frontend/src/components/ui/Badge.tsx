import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone =
  | 'slate'
  | 'green'
  | 'amber'
  | 'red'
  | 'indigo'
  | 'blue'
  | 'purple'

interface BadgeProps {
  tone?: Tone
  children: ReactNode
  className?: string
}

const toneStyles: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
}

export default function Badge({ tone = 'slate', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
