import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FaStarOfLife } from 'react-icons/fa'

import { ApiError } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const { login, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try {
      await login(email, password)
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/app/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed.'
      setError(message)
    }
  }

  return (
    <div className="auth-page auth-login-page">
      <section className="auth-side-panel auth-side-blue">
        <div className="auth-brand inline-actions" style={{ color: 'white' }}>
          <FaStarOfLife className="h-4 w-4" /> NexGen CRM
        </div>
        <h2>Empower your sales team to reach new heights.</h2>
        <p>
          The all-in-one relationship management platform designed to accelerate growth, optimize pipelines,
          and drive meaningful customer connections.
        </p>
        <div className="auth-metrics">
          <article>
            <strong>12k+</strong>
            <span>Active users</span>
          </article>
          <article>
            <strong>98%</strong>
            <span>Customer satisfaction</span>
          </article>
        </div>
      </section>
      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={onSubmit}>
          <h1>Welcome back</h1>
          <p>Enter your credentials to access your sales dashboard.</p>
          <label>
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in to account'}
          </button>
          <div className="auth-divider" />
          <p className="muted auth-register-label">New to NexusCRM?</p>
          <Link to="/register/subscription" className="btn btn-secondary btn-full">
            Register your organization
          </Link>
        </form>
      </section>
    </div>
  )
}
