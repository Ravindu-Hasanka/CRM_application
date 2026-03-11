import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="narrow-page unauthorized-card">
      <h1>Access denied</h1>
      <p>You do not have permission to view this page.</p>
      <Link to="/app/dashboard" className="btn btn-primary">
        Return to dashboard
      </Link>
    </div>
  )
}
