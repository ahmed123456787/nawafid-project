import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import Pagination from '../components/common/Pagination'
import ProjectCard from '../components/projects/ProjectCard'
import ProjectFormModal from '../components/projects/ProjectFormModal'
import { projectsApi } from '../api/projects'
import { useDebounce } from '../hooks/useDebounce'
import { useFetch } from '../hooks/useFetch'
import type { Paginated, Project } from '../types'

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const debouncedSearch = useDebounce(search, 300)
  const page = Number(searchParams.get('page') ?? '1') || 1

  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (debouncedSearch) next.set('q', debouncedSearch)
    else next.delete('q')
    if (debouncedSearch && page !== 1) next.set('page', '1')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const { data, loading, error, refetch } = useFetch<Paginated<Project>>(
    () => projectsApi.list({ q: debouncedSearch || undefined, page }),
    [debouncedSearch, page],
  )

  const goToPage = (next: number) => {
    const sp = new URLSearchParams(searchParams)
    sp.set('page', String(next))
    setSearchParams(sp)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Projects</h1>
        <Button onClick={() => setModalOpen(true)}>New project</Button>
      </div>

      <Input
        placeholder="Search by name or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title={debouncedSearch ? 'No matching projects' : 'No projects yet'}
          description={
            debouncedSearch
              ? 'Try a different search term.'
              : 'Create your first project to get started.'
          }
          action={
            !debouncedSearch && (
              <Button onClick={() => setModalOpen(true)}>New project</Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <Pagination
            page={data.current_page}
            lastPage={data.last_page}
            onPageChange={goToPage}
          />
        </>
      )}

      <ProjectFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={refetch}
      />
    </div>
  )
}
