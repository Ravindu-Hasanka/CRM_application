import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ApiError, createCompany, getCompany, updateCompany } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'

export default function CompanyFormPage() {
  const { tokens } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = useMemo(() => Boolean(id), [id])
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!tokens?.access || !isEdit || !id) return
    void getCompany(tokens.access, Number(id))
      .then((company) => {
        setName(company.name)
        setIndustry(company.industry)
        setCountry(company.country)
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load company details.')
      })
  }, [tokens?.access, isEdit, id])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tokens?.access) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      if (isEdit && id) {
        await updateCompany(tokens.access, Number(id), { name, industry, country })
        setMessage('Company updated successfully.')
      } else {
        await createCompany(tokens.access, { name, industry, country })
        setMessage('Company created successfully.')
      }
      setTimeout(() => navigate('/app/companies'), 600)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save company.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel form-panel">
      <header>
        <h2>{isEdit ? 'Edit Company' : 'Create Company'}</h2>
        <p>{isEdit ? 'Update company details.' : 'Add a new company record.'}</p>
      </header>
      <form onSubmit={onSubmit}>
        <label>
          Name
          <input type="text" required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Industry
          <input type="text" required value={industry} onChange={(event) => setIndustry(event.target.value)} />
        </label>
        <label>
          Country
          <input type="text" required value={country} onChange={(event) => setCountry(event.target.value)} />
        </label>
        <label>
          Logo
          <input type="file" disabled />
        </label>
        <p className="muted">Logo upload will be connected after S3 integration stage.</p>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}
        <div className="inline-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/app/companies')}>
            Cancel
          </button>
          <Link className="table-link" to="/app/companies">
            Back to list
          </Link>
        </div>
      </form>
    </section>
  )
}
