import { useEffect, useState, type FormEvent } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import { tasksApi } from '../../api/tasks'
import { PRIORITY_LABEL, STATUS_LABEL } from '../../lib/taskMeta'
import type {
  ProjectMember,
  Task,
  TaskPriority,
  TaskStatus,
} from '../../types'

interface TaskFormModalProps {
  open: boolean
  projectId: number
  members: ProjectMember[]
  task?: Task | null
  onClose: () => void
  onSaved: () => void
}

// Field names mirror the API payload so the submit handler stays trivial.
interface TaskFormState {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string
  assigned_to: string
}

const EMPTY_FORM: TaskFormState = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
  assigned_to: '',
}

function formFromTask(task: Task | null | undefined): TaskFormState {
  if (!task) return EMPTY_FORM
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    due_date: task.due_date ?? '',
    assigned_to: task.assigned_to ? String(task.assigned_to) : '',
  }
}

export default function TaskFormModal({
  open,
  projectId,
  members,
  task,
  onClose,
  onSaved,
}: TaskFormModalProps) {
  const isEdit = !!task

  const [form, setForm] = useState<TaskFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(formFromTask(task))
    setErrors({})
    setMessage(null)
  }, [open, task])

  const update = <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      }
      if (isEdit && task) {
        await tasksApi.update(task.id, payload)
      } else {
        await tasksApi.create(projectId, payload)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setErrors(err?.response?.data?.errors ?? {})
      setMessage(err?.response?.data?.message ?? 'Unable to save task.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit task' : 'New task'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="task-form" size="sm" loading={submitting}>
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {message && !Object.keys(errors).length && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        )}

        <Input
          label="Title"
          required
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          error={errors.title?.[0]}
          autoFocus
        />

        <Textarea
          label="Description"
          rows={3}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          error={errors.description?.[0]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => update('status', e.target.value as TaskStatus)}
            error={errors.status?.[0]}
          >
            {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>

          <Select
            label="Priority"
            value={form.priority}
            onChange={(e) => update('priority', e.target.value as TaskPriority)}
            error={errors.priority?.[0]}
          >
            {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </Select>

          <Input
            label="Due date"
            type="date"
            value={form.due_date}
            onChange={(e) => update('due_date', e.target.value)}
            error={errors.due_date?.[0]}
          />

          <Select
            label="Assignee"
            value={form.assigned_to}
            onChange={(e) => update('assigned_to', e.target.value)}
            error={errors.assigned_to?.[0]}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>
      </form>
    </Modal>
  )
}
