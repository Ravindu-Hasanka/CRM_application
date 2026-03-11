import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBolt, FaBuilding, FaUsers } from 'react-icons/fa6'

import { getActivityLogs, getCompanies, getContacts } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import type { ActivityLog, Company, Contact } from '../../types'

const statIcons = [FaBuilding, FaUsers, FaBolt]

export default function DashboardPage() {
  const { tokens, user } = useAuth()
  const { showToast } = useToast()
  const [companies, setCompanies] = useState<Company[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tokens?.access) return
    let mounted = true
    Promise.all([getCompanies(tokens.access), getContacts(tokens.access), getActivityLogs(tokens.access)])
      .then(([companiesRes, contactsRes, logsRes]) => {
        if (!mounted) return
        setCompanies(companiesRes)
        setContacts(contactsRes)
        setLogs(logsRes)
      })
      .catch(() => {
        if (!mounted) return
        setCompanies([])
        setContacts([])
        setLogs([])
        showToast('Failed to load dashboard data.', 'error', 14000)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [tokens?.access, showToast])

  const stats = useMemo(
    () => [
      { label: 'Total Companies', value: companies.length },
      { label: 'Total Contacts', value: contacts.length },
      { label: 'Recent Activity', value: logs.slice(0, 10).length },
    ],
    [companies.length, contacts.length, logs],
  )

  return (
    <section className="content-stack">
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = statIcons[index]
          return (
            <article key={stat.label} className="stat-card">
              <div className="stat-icon">
                <Icon className="h-4 w-4" />
              </div>
              <p>{stat.label}</p>
              <h3>{loading ? '...' : stat.value}</h3>
            </article>
          )
        })}
      </div>

      <article className="panel">
        <div className="panel-header-inline">
          <h3>Recent Activity</h3>
          <Link to="/app/activity-logs" className="table-link">
            View all
          </Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>Entity</th>
              <th>Action</th>
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 5).map((log) => (
              <tr key={log.id}>
                <td>{log.model_name}</td>
                <td>{log.action_type}</td>
                <td>{user?.email ?? 'User'}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>
                  <span className={`action-pill ${log.action_type.toLowerCase()}`}>
                    {log.action_type === 'DELETE' ? 'Failed' : 'Completed'}
                  </span>
                </td>
              </tr>
            ))}
            {!logs.length && !loading && (
              <tr>
                <td colSpan={5}>No activity records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </article>
    </section>
  )
}
