import { useEffect, useMemo, useState } from 'react'

import { ApiError, listActivityLogs } from '../../api/client'
import LoadingState from '../../components/LoadingState'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import type { ActivityLog } from '../../types'

export default function ActivityLogsPage() {
  const pageSize = 10
  const { tokens } = useAuth()
  const { showToast } = useToast()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<'ALL' | 'CREATE' | 'UPDATE' | 'DELETE'>('ALL')
  const [modelFilter, setModelFilter] = useState('ALL')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!tokens?.access) return
    setLoading(true)
    listActivityLogs(tokens.access, {
      page,
      search: search || undefined,
      action_type: actionFilter === 'ALL' ? undefined : actionFilter,
      model_name: modelFilter === 'ALL' ? undefined : modelFilter,
    })
      .then((response) => {
        setLogs(response.results)
        setCount(response.count)
      })
      .catch((err) => {
        setLogs([])
        setCount(0)
        showToast(err instanceof ApiError ? err.message : 'Failed to load activity logs.', 'error', 14000)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [tokens?.access, page, search, actionFilter, modelFilter, showToast])

  const models = useMemo(() => ['ALL', ...new Set(logs.map((log) => log.model_name))], [logs])
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const visiblePages = useMemo(() => {
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
    const pages: number[] = []
    for (let p = start; p <= end; p += 1) pages.push(p)
    return pages
  }, [page, totalPages])

  return (
    <section className="content-stack">
      <header className="panel">
        <h2>Activity logs</h2>
        <p>Audit events scoped to your organization access level.</p>
      </header>
      <div className="panel filters">
        <input
          placeholder="Search logs..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        <select
          value={actionFilter}
          onChange={(event) => {
            setActionFilter(event.target.value as typeof actionFilter)
            setPage(1)
          }}
        >
          <option value="ALL">All actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
        <select
          value={modelFilter}
          onChange={(event) => {
            setModelFilter(event.target.value)
            setPage(1)
          }}
        >
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
      <div className="panel table-wrap">
        {loading ? (
          <LoadingState label="Loading activity logs..." />
        ) : (
          <>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User ID</th>
              <th>Action</th>
              <th>Model</th>
              <th>Object ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.user_id ?? '-'}</td>
                <td>
                  <span className={`action-pill ${log.action_type.toLowerCase()}`}>{log.action_type}</span>
                </td>
                <td>{log.model_name}</td>
                <td>{log.object_id}</td>
              </tr>
            ))}
            {!logs.length && (
              <tr>
                <td colSpan={5}>No activity logs found for selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="table-footer">
          <span>
            {count > 0
              ? `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, count)} of ${count} entries`
              : 'Showing 0 entries'}
          </span>
          <div className="inline-actions">
            <button type="button" className="chip" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>
            {visiblePages.map((p) => (
              <button key={p} type="button" className={`chip ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
            <button type="button" className="chip" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </section>
  )
}
