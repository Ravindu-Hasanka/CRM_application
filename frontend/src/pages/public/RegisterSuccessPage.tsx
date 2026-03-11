import { Link, Navigate, useLocation } from 'react-router-dom'

import type { RegistrationDraft } from '../../types'

export default function RegisterSuccessPage() {
  const location = useLocation()
  const state = location.state as RegistrationDraft | null

  if (!state) {
    return <Navigate to="/register/subscription" replace />
  }

  return (
    <div className="narrow-page success-card">
      <h1>Organization registration completed</h1>
      <p>Your onboarding data has been accepted.</p>
      <dl>
        <dt>Organization</dt>
        <dd>{state.organizationName}</dd>
        <dt>Subscription</dt>
        <dd>{state.subscriptionPlan}</dd>
        <dt>Admin Email</dt>
        <dd>{state.adminEmail}</dd>
      </dl>
      <Link to="/login" className="btn btn-primary">
        Go to Login
      </Link>
    </div>
  )
}
