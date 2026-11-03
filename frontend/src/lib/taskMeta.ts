import type { TaskPriority, TaskStatus } from '../types'

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const STATUS_TONE: Record<TaskStatus, 'slate' | 'blue' | 'green'> = {
  todo: 'slate',
  in_progress: 'blue',
  done: 'green',
}

export const PRIORITY_TONE: Record<TaskPriority, 'slate' | 'amber' | 'red'> = {
  low: 'slate',
  medium: 'amber',
  high: 'red',
}
