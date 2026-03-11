import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { ApiError, deleteCompany, listCompanies } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'
import type { Company } from '../../types'

export default function CompaniesPage() {
  const pageSize = 10
  const { tokens, user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('All')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tokens?.access) return
    listCompanies(tokens.access, {
      page,
      search: search || undefined,
      country: countryFilter === 'All' ? undefined : countryFilter,
    })
      .then((response) => {
        setCompanies(response.results)
        setCount(response.count)
      })
      .catch((err) => {
        setCompanies([])
        setCount(0)
        setError(err instanceof ApiError ? err.message : 'Failed to load companies.')
      })
  }, [tokens?.access, page, search, countryFilter])

  const countries = useMemo(() => ['All', ...new Set(companies.map((company) => company.country))], [companies])
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const visiblePages = useMemo(() => {
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    const pages: number[] = []
    for (let p = start; p <= end; p += 1) pages.push(p)
    return pages
  }, [page, totalPages])

  const canEdit = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'SystemAdmin'
  const canDelete = user?.role === 'Admin' || user?.role === 'SystemAdmin'

  async function onDelete(companyId: number) {
    if (!tokens?.access) return
    if (!window.confirm('Delete this company? It will be soft deleted.')) return
    await deleteCompany(tokens.access, companyId)
    setCompanies((prev) => prev.filter((item) => item.id !== companyId))
    setCount((prev) => {
      const nextCount = Math.max(0, prev - 1)
      const nextTotalPages = Math.max(1, Math.ceil(nextCount / pageSize))
      if (page > nextTotalPages) setPage(nextTotalPages)
      return nextCount
    })
  }

  return (
    <section className="content-stack">
      <header className="panel panel-header">
        <div>
          <h2>Companies</h2>
          <p>Search, filter, and manage company records.</p>
        </div>
        {canEdit && (
          <Link to="/app/companies/new" className="btn btn-primary">
            Add Company
          </Link>
        )}
      </header>

      <div className="panel filters companies-filter-row">
        <div className="chip-group">
        </div>
        <input
          placeholder="Search company..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        <select
          value={countryFilter}
          onChange={(event) => {
            setCountryFilter(event.target.value)
            setPage(1)
          }}
        >
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Logo & Company</th>
              <th>Industry</th>
              <th>Country</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td>
                  <div className="company-cell">
                    <span className="company-avatar">{company.name.slice(0, 2).toUpperCase()}</span>
                    <div>
                      <strong>{company.name}</strong>
                      <p>{company.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="industry-tag">{company.industry}</span>
                </td>
                <td>{company.country}</td>
                <td>
                  <span className="status-dot" /> Active
                </td>
                <td>
                  <div className="inline-actions">
                    <Link to={`/app/companies/${company.id}`} className="table-link">
                      View
                    </Link>
                    {canEdit && (
                      <Link to={`/app/companies/${company.id}/edit`} className="table-link">
                        Edit
                      </Link>
                    )}
                    {canDelete && (
                      <button type="button" className="table-link" onClick={() => void onDelete(company.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!companies.length && (
              <tr>
                <td colSpan={5}>No company records found for current filters.</td>
              </tr>
            )}
          </tbody>
        </table>
        {error && <p className="form-error" style={{ marginTop: '0.75rem' }}>{error}</p>}
        <div className="table-footer">
          <span>
            {count > 0
              ? `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, count)} of ${count} entries`
              : 'Showing 0 entries'}
          </span>
          <div className="inline-actions">
            <button type="button" className="chip" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>
            {visiblePages.map((p) => (
              <button key={p} type="button" className={`chip ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
            <button type="button" className="chip" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
