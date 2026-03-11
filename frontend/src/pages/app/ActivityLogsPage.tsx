import { useEffect, useMemo, useState } from 'react'

import { ApiError, listActivityLogs } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'
import type { ActivityLog } from '../../types'

export default function ActivityLogsPage() {
  const { tokens } = useAuth()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<'ALL' | 'CREATE' | 'UPDATE' | 'DELETE'>('ALL')
  const [modelFilter, setModelFilter] = useState('ALL')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tokens?.access) return
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
        setError(err instanceof ApiError ? err.message : 'Failed to load activity logs.')
      })
  }, [tokens?.access, page, search, actionFilter, modelFilter])

  const models = useMemo(() => ['ALL', ...new Set(logs.map((log) => log.model_name))], [logs])

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
        {error && <p className="form-error" style={{ marginTop: '0.75rem' }}>{error}</p>}
        <div className="table-footer">
          <span>
            {count > 0
              ? `Showing ${(page - 1) * 10 + 1} to ${Math.min(page * 10, count)} of ${count} entries`
              : 'Showing 0 entries'}
          </span>
          <div className="inline-actions">
            <button className={`chip ${page === 1 ? 'active' : ''}`} onClick={() => setPage(1)}>
              1
            </button>
            <button className={`chip ${page === 2 ? 'active' : ''}`} onClick={() => setPage(2)}>
              2
            </button>
            <button className={`chip ${page === 3 ? 'active' : ''}`} onClick={() => setPage(3)}>
              3
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
