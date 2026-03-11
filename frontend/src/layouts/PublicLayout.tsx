import { Link, Outlet, useLocation } from 'react-router-dom'

export default function PublicLayout() {
  const { pathname } = useLocation()
  const isAuthScreen = pathname === '/login' || pathname.startsWith('/register/')

  return (
    <div className={`public-shell ${isAuthScreen ? 'public-shell-auth' : ''}`}>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between gap-6 px-6">
          <Link to="/" className="flex items-center gap-3 text-sm font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm text-white shadow-sm">
              ✦
            </span>
            <span>NexGen CRM</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-600 transition hover:text-blue-600">
              Features
            </a>
            <a href="#pricing" className="text-sm text-slate-600 transition hover:text-blue-600">
              Pricing
            </a>
            <a href="#solutions" className="text-sm text-slate-600 transition hover:text-blue-600">
              Solutions
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden text-sm text-slate-600 transition hover:text-blue-600 sm:inline">
              Login
            </Link>
            <Link
              to="/register/subscription"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      {!isAuthScreen && (
        <footer id="support" className="public-footer">
          <p>© 2026 NexusCRM. Built for modern sales teams.</p>
          <div className="public-footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Help</a>
          </div>
        </footer>
      )}
    </div>
  )
}
