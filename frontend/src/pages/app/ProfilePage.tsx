import { useEffect, useMemo, useState } from 'react'

import { ApiError, getMyOrganization, uploadOrganizationLogo } from '../../api/client'
import LoadingState from '../../components/LoadingState'
import RoleBadge from '../../components/RoleBadge'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import type { OrganizationProfile } from '../../types'

export default function ProfilePage() {
  const { user, tokens } = useAuth()
  const { showToast } = useToast()
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const subscription = useMemo(() => {
    if (!organization?.subscription_plan) return user?.organization_id ? 'Organization Plan' : 'Platform'
    return organization.subscription_plan
  }, [organization?.subscription_plan, user?.organization_id])
  const canUploadLogo = user?.role === 'Admin' || user?.role === 'SystemAdmin'

  useEffect(() => {
    if (!tokens?.access || !user?.organization_id) return
    setLoading(true)
    void getMyOrganization(tokens.access)
      .then((payload) => setOrganization(payload))
      .catch((err) => {
        showToast(err instanceof ApiError ? err.message : 'Failed to load organization profile.', 'error', 14000)
      })
      .finally(() => setLoading(false))
  }, [tokens?.access, user?.organization_id, showToast])

  async function onUploadLogo() {
    if (!tokens?.access || !logoFile) return
    setUploading(true)
    try {
      const updated = await uploadOrganizationLogo(tokens.access, logoFile)
      setOrganization(updated)
      setLogoFile(null)
      showToast('Organization logo updated successfully.', 'success', 10000)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to upload organization logo.', 'error', 14000)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <section className="panel form-panel">
        <LoadingState label="Loading profile..." />
      </section>
    )
  }

  return (
    <section className="panel form-panel">
      <h2>Profile</h2>
      <p>Current authenticated user information.</p>
      {user?.organization_id && (
        <div className="org-logo-panel">
          <div className="org-logo-preview">
            {organization?.logo_url ? (
              <img src={organization.logo_url} alt="Organization logo" />
            ) : (
              <span>{(organization?.name || user.organization_name || 'ORG').slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="org-logo-info">
            <h3>{organization?.name || user.organization_name || 'Organization'}</h3>
            <p>Upload a logo for your organization profile.</p>
            {canUploadLogo && (
              <div className="inline-actions">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
                />
                <button type="button" className="btn btn-primary" disabled={!logoFile || uploading} onClick={() => void onUploadLogo()}>
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <dl className="detail-grid">
        <dt>Email</dt>
        <dd>{user?.email ?? '-'}</dd>
        <dt>Username</dt>
        <dd>{user?.username ?? '-'}</dd>
        <dt>Role</dt>
        <dd>{user ? <RoleBadge role={user.role} /> : '-'}</dd>
        <dt>Organization ID</dt>
        <dd>{user?.organization_id ?? 'Platform'}</dd>
        <dt>Organization</dt>
        <dd>{organization?.name ?? user?.organization_name ?? 'Platform'}</dd>
        <dt>Subscription</dt>
        <dd>{subscription}</dd>
        <dt>Created</dt>
        <dd>{user?.created_at ? new Date(user.created_at).toLocaleString() : '-'}</dd>
      </dl>
    </section>
  )
}
