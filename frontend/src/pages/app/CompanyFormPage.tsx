import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export default function CompanyFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = useMemo(() => Boolean(id), [id])
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [country, setCountry] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Company form UI submitted. Connect POST/PATCH API when backend endpoints are available.')
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
          <input type="file" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} />
        </label>
        {logo && <p className="muted">Selected file: {logo.name}</p>}
        {message && <p className="form-success">{message}</p>}
        <div className="inline-actions">
          <button type="submit" className="btn btn-primary">
            Save
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
