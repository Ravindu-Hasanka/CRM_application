import { useEffect, useMemo, useState } from 'react'

import { ApiError, createUser, listUsers } from '../../api/client'
import LoadingState from '../../components/LoadingState'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import type { UserProfile, UserRole } from '../../types'

export default function UsersPage() {
  const { tokens, user } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('Staff')
  const [isActive, setIsActive] = useState(true)

  const allowedRoles = useMemo(() => {
    if (user?.role === 'SystemAdmin') return ['Admin', 'Manager', 'Staff'] as UserRole[]
    if (user?.role === 'Admin') return ['Manager', 'Staff'] as UserRole[]
    return ['Staff'] as UserRole[]
  }, [user?.role])

  async function loadUsers() {
    if (!tokens?.access) return
    setLoading(true)
    try {
      const payload = await listUsers(tokens.access)
      setUsers(payload)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to load users.', 'error', 14000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [tokens?.access])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tokens?.access) return
    setSubmitting(true)
    try {
      const created = await createUser(tokens.access, {
        email,
        username: username || undefined,
        password,
        role,
        is_active: isActive,
      })
      setUsers((prev) => [created, ...prev])
      setEmail('')
      setUsername('')
      setPassword('')
      setRole(allowedRoles[0] ?? 'Staff')
      setIsActive(true)
      showToast('User created successfully.', 'success', 10000)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to create user.', 'error', 14000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="content-stack">
      <header className="panel panel-header">
        <div>
          <h2>Team Members</h2>
          <p>Create and manage users in your organization.</p>
        </div>
      </header>

      <div className="panel">
        <h3>Add New Member</h3>
        <form className="users-form-grid" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="staff1@yourorg.com"
            />
          </label>
          <label>
            Username (Optional)
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="staff1"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Min. 8 characters"
            />
          </label>
          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              {allowedRoles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="users-checkbox">
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Active account
          </label>
          <div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel table-wrap">
        <h3 style={{ marginBottom: '0.75rem' }}>Members</h3>
        {loading ? (
          <LoadingState label="Loading team members..." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>{item.email}</td>
                  <td>{item.username ?? '-'}</td>
                  <td>{item.role}</td>
                  <td>{item.is_active ? 'Active' : 'Inactive'}</td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={5}>No users found in your organization.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
