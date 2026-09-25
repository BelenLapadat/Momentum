import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { timelineRepository } from '../data/timelineRepository'
import { eventRepository } from '../data/eventRepository'
import type { Orientation, Scale, Timeline } from '../types'
import {
  buildExportPayload,
  downloadJson,
  findImportConflicts,
  importPayload,
  parseExportPayload,
  type ConflictChoice,
  type ImportConflict,
  type ImportMode,
} from '../lib/importExport'
import { loadOrientation, loadScale, saveOrientation, saveScale } from '../lib/prefs'
import {
  OrientationControl,
  ScaleControl,
} from '../components/TimelineControls'

export function SettingsPage() {
  const { timelineId = '' } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [scale, setScale] = useState<Scale>(() => loadScale())
  const [orientation, setOrientation] = useState<Orientation>(() =>
    loadOrientation(),
  )
  const [pendingPayload, setPendingPayload] = useState<ReturnType<
    typeof parseExportPayload
  > | null>(null)
  const [askMode, setAskMode] = useState(false)
  const [conflicts, setConflicts] = useState<ImportConflict[]>([])
  const [conflictIndex, setConflictIndex] = useState(0)
  const [choices, setChoices] = useState<Record<string, ConflictChoice>>({})
  const [importMode, setImportMode] = useState<ImportMode>('merge')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void timelineRepository.get(timelineId).then((t) => setTimeline(t ?? null))
  }, [timelineId])

  async function handleExport() {
    if (!timeline) return
    const events = await eventRepository.listByTimeline(timeline.id)
    const payload = buildExportPayload(timeline, events)
    const safeName =
      timeline.title.replace(/[^\w\- ]+/g, '').trim() || 'timeline'
    downloadJson(`${safeName}.json`, payload)
  }

  async function onFileChosen(file: File) {
    setError(null)
    setMessage(null)
    try {
      const text = await file.text()
      const payload = parseExportPayload(JSON.parse(text))
      setPendingPayload(payload)
      setAskMode(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid import file')
    }
  }

  async function startImport(mode: ImportMode) {
    if (!pendingPayload) return
    setAskMode(false)
    setImportMode(mode)
    if (mode === 'merge') {
      const found = await findImportConflicts(timelineId, pendingPayload)
      if (found.length > 0) {
        setConflicts(found)
        setConflictIndex(0)
        setChoices({})
        return
      }
    }
    await finishImport(mode, {})
  }

  async function finishImport(
    mode: ImportMode,
    conflictChoices: Record<string, ConflictChoice>,
  ) {
    if (!pendingPayload) return
    try {
      const result = await importPayload({
        mode,
        currentTimelineId: timelineId,
        payload: pendingPayload,
        conflictChoices,
      })
      setPendingPayload(null)
      setConflicts([])
      setMessage(
        mode === 'create'
          ? 'Imported as a new timeline.'
          : 'Import merged into this timeline.',
      )
      if (mode === 'create') {
        navigate(`/timeline/${result.timelineId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    }
  }

  function resolveConflict(choice: ConflictChoice) {
    const current = conflicts[conflictIndex]
    if (!current) return
    const nextChoices = { ...choices, [current.imported.id]: choice }
    setChoices(nextChoices)
    if (conflictIndex + 1 < conflicts.length) {
      setConflictIndex(conflictIndex + 1)
    } else {
      void finishImport(importMode, nextChoices)
    }
  }

  if (!timeline) {
    return (
      <div className="app-shell mx-auto max-w-xl">
        <p>Timeline not found.</p>
        <Link className="btn btn-ghost mt-4 inline-flex" to="/">
          Dashboard
        </Link>
      </div>
    )
  }

  const activeConflict = conflicts[conflictIndex]

  return (
    <div className="app-shell mx-auto max-w-2xl">
      <Link
        to={`/timeline/${timeline.id}`}
        className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
      >
        ← Timeline
      </Link>
      <h1 className="brand m-0 mt-3 text-4xl">Settings</h1>
      <p className="text-[var(--ink-muted)]">{timeline.title}</p>

      <section className="surface mt-6 rounded-2xl p-6">
        <h2 className="brand m-0 text-2xl">Appearance</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Preferences are stored in this browser.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ScaleControl
            scale={scale}
            onChange={(next) => {
              setScale(next)
              saveScale(next)
            }}
          />
          <OrientationControl
            orientation={orientation}
            onChange={(next) => {
              setOrientation(next)
              saveOrientation(next)
            }}
          />
        </div>
      </section>

      <section className="surface mt-4 rounded-2xl p-6">
        <h2 className="brand m-0 text-2xl">Data</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Export or import this timeline as JSON. Single-event Word export is on
          the event detail screen.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleExport()}
          >
            Export timeline…
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => fileRef.current?.click()}
          >
            Import…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void onFileChosen(file)
              e.target.value = ''
            }}
          />
        </div>
        {message ? (
          <p className="mt-3 text-sm text-[var(--accent)]">{message}</p>
        ) : null}
        {error ? (
          <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>
        ) : null}
      </section>

      <section className="surface mt-4 rounded-2xl p-6">
        <h2 className="brand m-0 text-2xl">About</h2>
        <p className="mt-2 text-[var(--ink-muted)]">
          Momentum — local Dashboard; multiple timelines; data stays on this
          device.
        </p>
      </section>

      {askMode ? (
        <div className="modal-backdrop">
          <div className="modal surface flex flex-col gap-3">
            <h2 className="brand m-0 text-2xl">Import timeline</h2>
            <p className="m-0 text-[var(--ink-muted)]">
              Merge into this timeline, or create a new timeline from the file?
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setAskMode(false)
                  setPendingPayload(null)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => void startImport('create')}
              >
                Create new
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void startImport('merge')}
              >
                Merge into this
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {activeConflict ? (
        <div className="modal-backdrop">
          <div className="modal surface flex flex-col gap-3">
            <h2 className="brand m-0 text-2xl">
              Conflict ({conflictIndex + 1}/{conflicts.length})
            </h2>
            <p className="m-0">
              “{activeConflict.imported.title}” ({activeConflict.imported.year})
              already exists.
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => resolveConflict('keep')}
              >
                Keep existing
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => resolveConflict('overwrite')}
              >
                Overwrite with imported
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
