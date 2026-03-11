import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import PublicLayout from './layouts/PublicLayout'
import ActivityLogsPage from './pages/app/ActivityLogsPage'
import CompaniesPage from './pages/app/CompaniesPage'
import CompanyDetailPage from './pages/app/CompanyDetailPage'
import CompanyFormPage from './pages/app/CompanyFormPage'
import DashboardPage from './pages/app/DashboardPage'
import ProfilePage from './pages/app/ProfilePage'
import UsersPage from './pages/app/UsersPage'
import NotFoundPage from './pages/public/NotFoundPage'
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterOrganizationPage from './pages/public/RegisterOrganizationPage'
import RegisterSubscriptionPage from './pages/public/RegisterSubscriptionPage'
import RegisterSuccessPage from './pages/public/RegisterSuccessPage'
import UnauthorizedPage from './pages/public/UnauthorizedPage'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/register/subscription" replace />} />
        <Route path="/register/subscription" element={<RegisterSubscriptionPage />} />
        <Route path="/register/organization" element={<RegisterOrganizationPage />} />
        <Route path="/register/success" element={<RegisterSuccessPage />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route
            path="companies/new"
            element={<ProtectedRoute allowedRoles={['SystemAdmin', 'Admin', 'Manager']} />}
          >
            <Route index element={<CompanyFormPage />} />
          </Route>
          <Route path="companies/:id" element={<CompanyDetailPage />} />
          <Route
            path="companies/:id/edit"
            element={<ProtectedRoute allowedRoles={['SystemAdmin', 'Admin', 'Manager']} />}
          >
            <Route index element={<CompanyFormPage />} />
          </Route>
          <Route
            path="activity-logs"
            element={<ProtectedRoute allowedRoles={['SystemAdmin', 'Admin', 'Manager']} />}
          >
            <Route index element={<ActivityLogsPage />} />
          </Route>
          <Route
            path="users"
            element={<ProtectedRoute allowedRoles={['SystemAdmin', 'Admin', 'Manager']} />}
          >
            <Route index element={<UsersPage />} />
          </Route>
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
