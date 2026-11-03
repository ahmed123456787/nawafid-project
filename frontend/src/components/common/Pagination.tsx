import Button from '../ui/Button'

interface PaginationProps {
  page: number
  lastPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  page,
  lastPage,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null

  return (
    <div className="flex items-center justify-between gap-2 pt-4">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-slate-600">
        Page {page} of {lastPage}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
