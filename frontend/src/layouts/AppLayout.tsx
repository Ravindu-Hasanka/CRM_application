import { Link, NavLink, Outlet } from 'react-router-dom'
import { FaBuilding, FaRegCircleUser } from 'react-icons/fa6'
import { FiActivity, FiBarChart2, FiGrid, FiLogOut } from 'react-icons/fi'

import RoleBadge from '../components/RoleBadge'
import { useAuth } from '../contexts/AuthContext'

const BASE_ITEMS = [
  { label: 'Dashboard', to: '/app/dashboard', icon: FiGrid },
  { label: 'Companies', to: '/app/companies', icon: FaBuilding },
  { label: 'Activity Logs', to: '/app/activity-logs', icon: FiActivity },
  { label: 'Profile', to: '/app/profile', icon: FaRegCircleUser },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const role = user?.role ?? 'Staff'

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link className="brand sidebar-brand" to="/app/dashboard">
          <span className="brand-mark">
            <FiGrid className="h-4 w-4" />
          </span>
          <span className="brand-text">CRM Admin</span>
        </Link>
        <p className="sidebar-version">v1.0.2 - Enterprise</p>

        <nav className="app-menu">
          {BASE_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-user">
          <p className="sidebar-user-name">{user?.email ?? 'user@company.com'}</p>
          <p className="sidebar-user-label">{role}</p>
          {user && <RoleBadge role={user.role} />}
          <button type="button" className="btn btn-secondary btn-full" onClick={logout}>
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-tabs">
            <span className="topbar-tab-active">Overview</span>
            <span className="inline-actions">
              <FiBarChart2 className="h-4 w-4" />
              Reports
            </span>
          </div>
          
          <div className="inline-actions topbar-meta">
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
