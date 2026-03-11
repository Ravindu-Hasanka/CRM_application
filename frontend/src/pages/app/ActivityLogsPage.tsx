import { useEffect, useMemo, useState } from 'react'

import { getActivityLogs } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'
import type { ActivityLog } from '../../types'

export default function ActivityLogsPage() {
  const { tokens } = useAuth()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [actionFilter, setActionFilter] = useState<'ALL' | 'CREATE' | 'UPDATE' | 'DELETE'>('ALL')
  const [modelFilter, setModelFilter] = useState('ALL')

  useEffect(() => {
    if (!tokens?.access) return
    getActivityLogs(tokens.access).then(setLogs).catch(() => setLogs([]))
  }, [tokens?.access])

  const models = useMemo(() => ['ALL', ...new Set(logs.map((log) => log.model_name))], [logs])
  const filtered = logs.filter((log) => {
    const actionMatches = actionFilter === 'ALL' || log.action_type === actionFilter
    const modelMatches = modelFilter === 'ALL' || log.model_name === modelFilter
    return actionMatches && modelMatches
  })

  return (
    <section className="content-stack">
      <header className="panel">
        <h2>Activity logs</h2>
        <p>Audit events scoped to your organization access level.</p>
      </header>
      <div className="panel filters">
        <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value as typeof actionFilter)}>
          <option value="ALL">All actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
        <select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)}>
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
            {filtered.map((log) => (
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
            {!filtered.length && (
              <tr>
                <td colSpan={5}>No activity logs found for selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
