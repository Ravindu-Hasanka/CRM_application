import { Link, NavLink, Outlet } from 'react-router-dom'

import RoleBadge from '../components/RoleBadge'
import { useAuth } from '../contexts/AuthContext'

const BASE_ITEMS = [
  { label: 'Dashboard', to: '/app/dashboard' },
  { label: 'Companies', to: '/app/companies' },
  { label: 'Activity Logs', to: '/app/activity-logs' },
  { label: 'Profile', to: '/app/profile' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const role = user?.role ?? 'Staff'

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link className="brand sidebar-brand" to="/app/dashboard">
          <span className="brand-mark">▦</span>
          <span className="brand-text">CRM Admin</span>
        </Link>
        <p className="sidebar-version">v1.0.2 • Enterprise</p>
        <nav className="app-menu">
          {BASE_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="sidebar-system-label">SYSTEM</p>
        <button type="button" className="menu-link menu-link-static">
          Settings
        </button>
        <div className="sidebar-user">
          <p className="sidebar-user-name">{user?.email ?? 'user@company.com'}</p>
          <p className="sidebar-user-label">{role}</p>
          {user && <RoleBadge role={user.role} />}
          <button type="button" className="btn btn-secondary btn-full" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-tabs">
            <strong>Nexus Corp</strong>
            <span className="topbar-tab-active">Overview</span>
            <span>Reports</span>
          </div>
          <input className="topbar-search" placeholder="Search data..." />
          <div>
            <span className="badge badge-neutral">Org ID: {user?.organization_id ?? 'Platform'}</span>
            {user && <RoleBadge role={user.role} />}
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
