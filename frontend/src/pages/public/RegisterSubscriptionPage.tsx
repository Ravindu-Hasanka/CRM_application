import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import type { SubscriptionPlan } from '../../types'

const PLANS: SubscriptionPlan[] = ['Basic', 'Pro']

export default function RegisterSubscriptionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialPlan = useMemo(() => {
    const value = new URLSearchParams(location.search).get('plan')
    return value === 'Pro' ? 'Pro' : 'Basic'
  }, [location.search])
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(initialPlan)

  function continueToRegistration() {
    navigate(`/register/organization?plan=${selectedPlan}`)
  }

  return (
    <div className="narrow-page register-subscription-page">
      <div className="step-header">
        <div>
          <span>STEP 2 OF 3</span>
          <span>66% Complete</span>
        </div>
        <div className="step-progress">
          <span />
        </div>
      </div>
      <header className="section-header">
        <p>Select your preferred plan</p>
        <h1>
          Scalable plans for <span className="text-accent">everyone</span>
        </h1>
        <p>Simple, transparent pricing that grows with your team.</p>
      </header>
      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <button type="button" key={plan} className={`plan-card selectable ${selectedPlan === plan ? 'selected' : ''}`} onClick={() => setSelectedPlan(plan)}>
            {plan === 'Pro' && <span className="plan-pill">Most Popular</span>}
            <h3>{plan}</h3>
            <p className="plan-price">
              {plan === 'Basic' ? '$0' : '$29'} <span>/month</span>
            </p>
            <p>{plan === 'Basic' ? 'Perfect for individuals and small side projects.' : 'Advanced tools for growing teams and startups.'}</p>

            <ul>
              {plan === 'Basic' ? (
                <>
                  <li>Core workflow features</li>
                  <li>5GB secure cloud storage</li>
                  <li>Single workspace</li>
                </>
              ) : (
                <>
                  <li>Unlimited automation recipes</li>
                  <li>50GB storage per user</li>
                  <li>Priority 24/7 support</li>
                </>
              )}

              <div className={`btn ${selectedPlan === plan ? 'btn-primary' : 'btn-secondary'} btn-full`}>
                {plan === 'Basic' ? 'Choose Basic' : 'Choose Pro'}
              </div>
            </ul>
          </button>
        ))}
      </div>
      <div className="inline-actions subscription-actions">
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
          Back
        </button>
        <button type="button" className="btn btn-primary" onClick={continueToRegistration}>
          Continue
        </button>
      </div>
    </div>
  )
}
