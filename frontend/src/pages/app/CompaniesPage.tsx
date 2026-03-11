import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getCompanies } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'
import type { Company } from '../../types'

export default function CompaniesPage() {
  const { tokens, user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('All')
  const [countryFilter, setCountryFilter] = useState('All')

  useEffect(() => {
    if (!tokens?.access) return
    getCompanies(tokens.access).then(setCompanies).catch(() => setCompanies([]))
  }, [tokens?.access])

  const countries = useMemo(() => ['All', ...new Set(companies.map((company) => company.country))], [companies])

  const filtered = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(search.toLowerCase())
    const matchesIndustry = industryFilter === 'All' || company.industry === industryFilter
    const matchesCountry = countryFilter === 'All' || company.country === countryFilter
    return matchesSearch && matchesIndustry && matchesCountry
  })

  const canEdit = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'SystemAdmin'
  const industryChips = ['All', 'Technology', 'Healthcare', 'Finance', 'Manufacturing']

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
          {industryChips.map((chip) => (
            <button
              type="button"
              key={chip}
              className={`chip ${industryFilter === chip ? 'active' : ''}`}
              onClick={() => setIndustryFilter(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
        <input placeholder="Search company..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)}>
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
            {filtered.map((company) => (
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
                <td className="inline-actions">
                  <Link to={`/app/companies/${company.id}`} className="table-link">
                    View
                  </Link>
                  {canEdit && (
                    <Link to={`/app/companies/${company.id}/edit`} className="table-link">
                      Edit
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={5}>No company records found for current filters.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="table-footer">
          <span>
            Showing 1 to {Math.min(filtered.length, 10)} of {filtered.length} entries
          </span>
          <div className="inline-actions">
            <button className="chip active">1</button>
            <button className="chip">2</button>
            <button className="chip">3</button>
          </div>
        </div>
      </div>
    </section>
  )
}
