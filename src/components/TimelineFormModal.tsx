import { useEffect, useState, type FormEvent } from 'react'

type TimelineFormModalProps = {
  title: string
  initialTitle?: string
  initialDescription?: string
  submitLabel: string
  onClose: () => void
  onSubmit: (values: { title: string; description: string }) => Promise<void>
}

export function TimelineFormModal({
  title,
  initialTitle = '',
  initialDescription = '',
  submitLabel,
  onClose,
  onSubmit,
}: TimelineFormModalProps) {
  const [name, setName] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Title is required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ title: name.trim(), description: description.trim() })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal surface"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="brand m-0 mb-4 text-2xl">{title}</h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="timeline-title">Title</label>
            <input
              id="timeline-title"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="field">
            <label htmlFor="timeline-description">Description</label>
            <textarea
              id="timeline-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {error ? <p className="m-0 text-sm text-[var(--danger)]">{error}</p> : null}
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
