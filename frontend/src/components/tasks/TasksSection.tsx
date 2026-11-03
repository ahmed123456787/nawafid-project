import { useEffect, useState } from 'react'
import ConfirmDialog from '../common/ConfirmDialog'
import Pagination from '../common/Pagination'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Spinner from '../ui/Spinner'
import TaskFormModal from './TaskFormModal'
import TasksTable from './TasksTable'
import { tasksApi } from '../../api/tasks'
import { useDebounce } from '../../hooks/useDebounce'
import { PRIORITY_LABEL, STATUS_LABEL } from '../../lib/taskMeta'
import type {
  Paginated,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
} from '../../types'

interface TasksSectionProps {
  project: Project
  canManage: boolean
}

export default function TasksSection({ project, canManage }: TasksSectionProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')
  const [page, setPage] = useState(1)

  const [data, setData] = useState<Paginated<Task> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await tasksApi.list(project.id, {
        q: debouncedSearch || undefined,
        status: status || undefined,
        priority: priority || undefined,
        page,
      })
      setData(res)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, priority])

  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, debouncedSearch, status, priority, page])

  const openCreate = () => {
    setEditTarget(null)
    setFormOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditTarget(task)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await tasksApi.remove(deleteTarget.id)
      setDeleteTarget(null)
      fetchTasks()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to delete task.')
    } finally {
      setDeleting(false)
    }
  }

  const members = project.members ?? []

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">Tasks</h2>
        <Button size="sm" onClick={openCreate}>
          New task
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <Input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus | '')}
          className="sm:w-40"
        >
          <option value="">All statuses</option>
          {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <Select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority | '')}
          className="sm:w-40"
        >
          <option value="">All priorities</option>
          {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTasks} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            title={
              debouncedSearch || status || priority
                ? 'No matching tasks'
                : 'No tasks yet'
            }
            description={
              debouncedSearch || status || priority
                ? 'Try adjusting your filters.'
                : 'Create the first task to get started.'
            }
            action={
              !debouncedSearch && !status && !priority ? (
                <Button onClick={openCreate}>New task</Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <TasksTable
              tasks={data.data}
              canManage={canManage}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
            <Pagination
              page={data.current_page}
              lastPage={data.last_page}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <TaskFormModal
        open={formOpen}
        projectId={project.id}
        members={members}
        task={editTarget}
        onClose={() => setFormOpen(false)}
        onSaved={fetchTasks}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task?"
        message={
          deleteTarget ? `Delete "${deleteTarget.title}"?` : undefined
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  )
}
