import { useEffect, useState, type FormEvent } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import Textarea from '../ui/Textarea'
import { projectsApi } from '../../api/projects'
import type { Project } from '../../types'

interface ProjectFormModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  project?: Project | null
}

export default function ProjectFormModal({
  open,
  onClose,
  onSaved,
  project,
}: ProjectFormModalProps) {
  const isEdit = !!project
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(project?.name ?? '')
      setDescription(project?.description ?? '')
      setErrors({})
      setMessage(null)
    }
  }, [open, project])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { name, description: description || null }
      if (isEdit && project) {
        await projectsApi.update(project.id, payload)
      } else {
        await projectsApi.create(payload)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setErrors(err?.response?.data?.errors ?? {})
      setMessage(err?.response?.data?.message ?? 'Unable to save project.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit project' : 'New project'}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="project-form"
            size="sm"
            loading={submitting}
          >
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {message && !Object.keys(errors).length && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        )}
        <Input
          label="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name?.[0]}
          autoFocus
        />
        <Textarea
          label="Description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description?.[0]}
        />
      </form>
    </Modal>
  )
}
