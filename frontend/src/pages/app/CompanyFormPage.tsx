import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ApiError, createCompany, getCompany, updateCompany } from '../../api/client'
import LoadingState from '../../components/LoadingState'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function CompanyFormPage() {
  const { tokens } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = useMemo(() => Boolean(id), [id])
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [country, setCountry] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)

  useEffect(() => {
    if (!tokens?.access || !isEdit || !id) return
    setInitialLoading(true)
    void getCompany(tokens.access, Number(id))
      .then((company) => {
        setName(company.name)
        setIndustry(company.industry)
        setCountry(company.country)
        setExistingLogoUrl(company.logo)
      })
      .catch((err) => {
        showToast(err instanceof ApiError ? err.message : 'Failed to load company details.', 'error', 14000)
      })
      .finally(() => {
        setInitialLoading(false)
      })
  }, [tokens?.access, isEdit, id, showToast])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tokens?.access) return
    setLoading(true)
    try {
      if (isEdit && id) {
        await updateCompany(tokens.access, Number(id), { name, industry, country, logo: logoFile })
        showToast('Company updated successfully.', 'success', 10000)
      } else {
        await createCompany(tokens.access, { name, industry, country, logo: logoFile })
        showToast('Company created successfully.', 'success', 10000)
      }
      setTimeout(() => navigate('/app/companies'), 600)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to save company.', 'error', 14000)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <section className="panel form-panel">
        <LoadingState label="Loading company data..." />
      </section>
    )
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
          <input type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} />
        </label>
        {logoFile && <p className="muted">Selected file: {logoFile.name}</p>}
        {!logoFile && existingLogoUrl && (
          <div className="company-logo-preview">
            <img src={existingLogoUrl} alt="Company logo" />
          </div>
        )}
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
