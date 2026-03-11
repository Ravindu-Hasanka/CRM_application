import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="narrow-page unauthorized-card">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/" className="btn btn-secondary">
        Back to home
      </Link>
    </div>
  )
}
