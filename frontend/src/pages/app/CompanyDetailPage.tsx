import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getCompanies, getContacts } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'
import type { Company, Contact } from '../../types'

export default function CompanyDetailPage() {
  const { id } = useParams()
  const { tokens, user } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    if (!id || !tokens?.access) return
    Promise.all([getCompanies(tokens.access), getContacts(tokens.access)])
      .then(([companiesRes, contactsRes]) => {
        setCompany(companiesRes.find((item) => item.id === Number(id)) ?? null)
        setContacts(contactsRes.filter((contact) => contact.company_id === Number(id)))
      })
      .catch(() => {
        setCompany(null)
        setContacts([])
      })
  }, [id, tokens?.access])

  const canEdit = useMemo(
    () => user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'SystemAdmin',
    [user?.role],
  )

  if (!company) {
    return (
      <section className="panel">
        <h2>Company not found</h2>
        <Link to="/app/companies" className="btn btn-secondary">
          Back to companies
        </Link>
      </section>
    )
  }

  return (
    <section className="content-stack">
      <header className="panel panel-header">
        <div>
          <h2>{company.name}</h2>
          <p>
            {company.industry} • {company.country}
          </p>
        </div>
        {canEdit && (
          <Link to={`/app/companies/${company.id}/edit`} className="btn btn-primary">
            Edit Company
          </Link>
        )}
      </header>

      <article className="panel">
        <h3>Company details</h3>
        <dl className="detail-grid">
          <dt>Created</dt>
          <dd>{new Date(company.created_at).toLocaleString()}</dd>
          <dt>Updated</dt>
          <dd>{new Date(company.updated_at).toLocaleString()}</dd>
          <dt>Organization ID</dt>
          <dd>{company.organization_id}</dd>
        </dl>
      </article>

      <article className="panel table-wrap">
        <div className="panel-header-inline">
          <h3>Contacts</h3>
          {canEdit && <button className="btn btn-secondary">Add Contact (UI)</button>}
        </div>
        <table>
          <thead>
            <tr>
              <th>Full name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.full_name}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
                <td>{contact.role}</td>
              </tr>
            ))}
            {!contacts.length && (
              <tr>
                <td colSpan={4}>No contacts found for this company.</td>
              </tr>
            )}
          </tbody>
        </table>
      </article>
    </section>
  )
}
