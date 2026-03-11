import type { UserRole } from '../types'

export default function RoleBadge({ role }: { role: UserRole }) {
  const classMap: Record<UserRole, string> = {
    SystemAdmin: 'badge badge-danger',
    Admin: 'badge badge-primary',
    Manager: 'badge badge-warning',
    Staff: 'badge badge-neutral',
  }

  return <span className={classMap[role]}>{role}</span>
}
