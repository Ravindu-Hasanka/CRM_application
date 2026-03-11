import { useMemo } from 'react'

import RoleBadge from '../../components/RoleBadge'
import { useAuth } from '../../contexts/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()
  const subscription = useMemo(() => {
    if (!user?.organization_id) return 'Platform'
    return 'Organization Plan'
  }, [user?.organization_id])

  return (
    <section className="panel form-panel">
      <h2>Profile</h2>
      <p>Current authenticated user information.</p>
      <dl className="detail-grid">
        <dt>Email</dt>
        <dd>{user?.email ?? '-'}</dd>
        <dt>Username</dt>
        <dd>{user?.username ?? '-'}</dd>
        <dt>Role</dt>
        <dd>{user ? <RoleBadge role={user.role} /> : '-'}</dd>
        <dt>Organization ID</dt>
        <dd>{user?.organization_id ?? 'Platform'}</dd>
        <dt>Subscription</dt>
        <dd>{subscription}</dd>
        <dt>Created</dt>
        <dd>{user?.created_at ? new Date(user.created_at).toLocaleString() : '-'}</dd>
      </dl>
    </section>
  )
}
