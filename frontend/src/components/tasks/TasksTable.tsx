import Badge from '../ui/Badge'
import Button from '../ui/Button'
import {
  PRIORITY_LABEL,
  PRIORITY_TONE,
  STATUS_LABEL,
  STATUS_TONE,
} from '../../lib/taskMeta'
import type { Task } from '../../types'

interface TasksTableProps {
  tasks: Task[]
  canManage: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export default function TasksTable({
  tasks,
  canManage,
  onEdit,
  onDelete,
}: TasksTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Priority</th>
            <th className="px-4 py-2">Assignee</th>
            <th className="px-4 py-2">Due date</th>
            {canManage && <th className="px-4 py-2 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <td className="px-4 py-2 font-medium text-slate-900">{t.title}</td>
              <td className="px-4 py-2">
                <Badge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
              </td>
              <td className="px-4 py-2">
                <Badge tone={PRIORITY_TONE[t.priority]}>
                  {PRIORITY_LABEL[t.priority]}
                </Badge>
              </td>
              <td className="px-4 py-2 text-slate-700">
                {t.assignee?.name ?? <span className="text-slate-400">—</span>}
              </td>
              <td className="px-4 py-2 text-slate-700">
                {t.due_date ? (
                  new Date(t.due_date).toLocaleDateString()
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              {canManage && (
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onEdit(t)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(t)}>
                      Delete
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
