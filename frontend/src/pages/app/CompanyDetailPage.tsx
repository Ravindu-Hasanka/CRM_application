import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaCircle } from 'react-icons/fa'

import { ApiError, createContact, deleteContact, getCompany, listContacts, updateContact } from '../../api/client'
import LoadingState from '../../components/LoadingState'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import type { Company, Contact } from '../../types'

export default function CompanyDetailPage() {
  const { id } = useParams()
  const { tokens, user } = useAuth()
  const { showToast } = useToast()
  const [company, setCompany] = useState<Company | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactRole, setContactRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editRole, setEditRole] = useState('')

  useEffect(() => {
    if (!id || !tokens?.access) return
    setLoading(true)
    Promise.all([getCompany(tokens.access, Number(id)), listContacts(tokens.access, { company_id: Number(id), page: 1 })])
      .then(([companyRes, contactsRes]) => {
        setCompany(companyRes)
        setContacts(contactsRes.results)
      })
      .catch((err) => {
        setCompany(null)
        setContacts([])
        showToast(err instanceof ApiError ? err.message : 'Failed to load company.', 'error', 14000)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, tokens?.access, showToast])

  const canEdit = useMemo(
    () => user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'SystemAdmin',
    [user?.role],
  )
  const canDelete = user?.role === 'Admin' || user?.role === 'SystemAdmin'

  async function onCreateContact() {
    if (!tokens?.access || !company) return
    setSaving(true)
    try {
      const created = await createContact(tokens.access, {
        company: company.id,
        full_name: contactName,
        email: contactEmail,
        phone: contactPhone,
        role: contactRole,
      })
      setContacts((prev) => [created, ...prev])
      setContactName('')
      setContactEmail('')
      setContactPhone('')
      setContactRole('')
      showToast('Contact created successfully.', 'success', 10000)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to create contact.', 'error', 14000)
    } finally {
      setSaving(false)
    }
  }

  async function onDeleteContact(contactId: number) {
    if (!tokens?.access) return
    if (!window.confirm('Delete this contact?')) return
    try {
      await deleteContact(tokens.access, contactId)
      setContacts((prev) => prev.filter((item) => item.id !== contactId))
      showToast('Contact deleted successfully.', 'success', 10000)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete contact.', 'error', 14000)
    }
  }

  function onOpenEdit(contact: Contact) {
    setEditingContact(contact)
    setEditName(contact.full_name)
    setEditEmail(contact.email)
    setEditPhone(contact.phone)
    setEditRole(contact.role)
  }

  function onCloseEdit() {
    setEditingContact(null)
    setEditName('')
    setEditEmail('')
    setEditPhone('')
    setEditRole('')
  }

  async function onSaveEdit() {
    if (!tokens?.access || !editingContact) return
    if (!editName.trim() || !editEmail.trim() || !editRole.trim()) {
      showToast('Name, email, and role are required.', 'error', 12000)
      return
    }

    try {
      const updated = await updateContact(tokens.access, editingContact.id, {
        full_name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        role: editRole.trim(),
      })
      setContacts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      showToast('Contact updated successfully.', 'success', 10000)
      onCloseEdit()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to update contact.', 'error', 14000)
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <LoadingState label="Loading company details..." />
      </section>
    )
  }

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
          <p className="inline-actions">
            <span>{company.industry}</span>
            <FaCircle className="h-2 w-2" />
            <span>{company.country}</span>
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
          {canEdit && <button className="btn btn-secondary" onClick={() => void onCreateContact()} disabled={saving || !contactName || !contactEmail || !contactRole}>Add Contact</button>}
        </div>
        {canEdit && (
          <div className="inline-actions" style={{ marginBottom: '0.8rem' }}>
            <input placeholder="Full name" value={contactName} onChange={(event) => setContactName(event.target.value)} />
            <input placeholder="Email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
            <input placeholder="Phone (optional)" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
            <input placeholder="Role" value={contactRole} onChange={(event) => setContactRole(event.target.value)} />
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>Full name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.full_name}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
                <td>{contact.role}</td>
                <td className="inline-actions">
                  {canEdit && (
                    <button type="button" className="table-link" onClick={() => onOpenEdit(contact)}>
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button type="button" className="table-link" onClick={() => void onDeleteContact(contact.id)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!contacts.length && (
              <tr>
                <td colSpan={5}>No contacts found for this company.</td>
              </tr>
            )}
          </tbody>
        </table>
      </article>

      {editingContact && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit contact">
          <div className="modal-card">
            <div className="panel-header-inline">
              <h3>Edit Contact</h3>
              <button type="button" className="btn btn-secondary" onClick={onCloseEdit}>
                Close
              </button>
            </div>
            <div className="users-form-grid" style={{ marginTop: '0.4rem' }}>
              <label>
                Full Name
                <input value={editName} onChange={(event) => setEditName(event.target.value)} />
              </label>
              <label>
                Email
                <input type="email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} />
              </label>
              <label>
                Phone
                <input value={editPhone} onChange={(event) => setEditPhone(event.target.value)} />
              </label>
              <label>
                Role
                <input value={editRole} onChange={(event) => setEditRole(event.target.value)} />
              </label>
            </div>
            <div className="inline-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onCloseEdit}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={() => void onSaveEdit()}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
