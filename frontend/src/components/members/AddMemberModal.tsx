import { useEffect, useState, type FormEvent } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import Spinner from '../ui/Spinner'
import { membersApi } from '../../api/members'
import { usersApi } from '../../api/users'
import { useDebounce } from '../../hooks/useDebounce'
import { apiMessage } from '../../lib/apiError'
import type { ProjectMember, Role, User } from '../../types'

interface AddMemberModalProps {
  open: boolean
  projectId: number
  existingMembers: ProjectMember[]
  onClose: () => void
  onAdded: () => void
}

export default function AddMemberModal({
  open,
  projectId,
  existingMembers,
  onClose,
  onAdded,
}: AddMemberModalProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [users, setUsers] = useState<User[]>([])
  const [searching, setSearching] = useState(false)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [role, setRole] = useState<Role>('member')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSearch('')
      setUsers([])
      setSelectedId(null)
      setRole('member')
      setMessage(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setSearching(true)
    usersApi
      .list({ q: debouncedSearch || undefined, per_page: 10 })
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setSearching(false))
  }, [open, debouncedSearch])

  const existingIds = new Set(existingMembers.map((m) => m.id))
  const candidates = users.filter((u) => !existingIds.has(u.id))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    setSubmitting(true)
    setMessage(null)
    try {
      await membersApi.add(projectId, { user_id: selectedId, role })
      onAdded()
      onClose()
    } catch (err) {
      setMessage(apiMessage(err, 'Unable to add member.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add member"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-member-form"
            size="sm"
            loading={submitting}
            disabled={!selectedId}
          >
            Add
          </Button>
        </>
      }
    >
      <form id="add-member-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {message && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        )}

        <Input
          label="Search users"
          placeholder="Name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSelectedId(null)
          }}
        />

        <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200">
          {searching ? (
            <div className="flex items-center justify-center py-6 text-slate-400">
              <Spinner size="sm" />
            </div>
          ) : candidates.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-500">
              No users found.
            </p>
          ) : (
            candidates.map((u) => {
              const selected = u.id === selectedId
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedId(u.id)}
                  className={`flex w-full flex-col items-start border-b border-slate-100 px-3 py-2 text-left text-sm last:border-0 hover:bg-slate-50 ${
                    selected ? 'bg-indigo-50' : ''
                  }`}
                >
                  <span className="font-medium text-slate-900">{u.name}</span>
                  <span className="text-xs text-slate-500">{u.email}</span>
                </button>
              )
            })
          )}
        </div>

        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value="member">Member</option>
          <option value="owner">Owner</option>
        </Select>
      </form>
    </Modal>
  )
}
