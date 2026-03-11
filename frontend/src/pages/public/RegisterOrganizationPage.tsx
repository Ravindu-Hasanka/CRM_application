import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ApiError, createOrganization } from '../../api/client'
import { useToast } from '../../contexts/ToastContext'
import type { RegistrationDraft, SubscriptionPlan } from '../../types'

export default function RegisterOrganizationPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const selectedPlan = useMemo<SubscriptionPlan>(() => (searchParams.get('plan') === 'Pro' ? 'Pro' : 'Basic'), [searchParams])

  const [organizationName, setOrganizationName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (adminPassword !== confirmPassword) {
      showToast('Password confirmation does not match.', 'error', 12000)
      return
    }

    const draft: RegistrationDraft = {
      subscriptionPlan: selectedPlan,
      organizationName,
      adminEmail,
      adminUsername,
    }

    setLoading(true)
    try {
      await createOrganization({
        name: organizationName,
        subscription_plan: selectedPlan,
        admin_email: adminEmail,
        admin_password: adminPassword,
        admin_username: adminUsername || undefined,
      })
      showToast('Organization registered successfully.', 'success', 10000)
      navigate('/register/success', { state: draft, replace: true })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Registration failed. Please try again.'
      showToast(message, 'error', 14000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-grid">
      <aside className="register-summary">
        <span className="eyebrow">Step 2 of 2</span>
        <h2>Register your organization</h2>
        <p>Complete the details to get started with your new workspace and invite your team members.</p>
        <div className="summary-plan-card">
          <h3>{selectedPlan} Plan</h3>
          <ul>
            <li>Up to 20 users included</li>
            <li>Priority 24/7 support</li>
            <li>Advanced security features</li>
          </ul>
          <p className="plan-price">
            {selectedPlan === 'Pro' ? '$49' : '$0'} <span>/month</span>
          </p>
        </div>
        <div className="summary-note">You won't be charged until the end of your 14-day trial period.</div>
      </aside>

      <form className="register-form org-form" onSubmit={onSubmit}>
        <h1>Organization Details</h1>
        <label>
          Organization Name
          <input
            type="text"
            required
            placeholder="e.g. Acme Corp"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
          />
        </label>
        <label>
          Organization Size
          <select defaultValue="">
            <option value="" disabled>
              Select size
            </option>
            <option>1-10</option>
            <option>11-50</option>
            <option>51-200</option>
            <option>200+</option>
          </select>
        </label>
        <hr />
        <h2>Administrator Details</h2>
        <p>This user will be the primary owner of the account.</p>
        <label>
          Email Address
          <input
            type="email"
            required
            placeholder="john@acmecorp.com"
            value={adminEmail}
            onChange={(event) => setAdminEmail(event.target.value)}
          />
        </label>
        <label>
          Username
          <input type="text" placeholder="john.doe" value={adminUsername} onChange={(event) => setAdminUsername(event.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
          />
        </label>
        <label>
          Confirm Password
          <input
            type="password"
            required
            minLength={8}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Create Account & Start Trial'}
        </button>
      </form>
    </div>
  )
}
