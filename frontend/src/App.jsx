import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './features/Auth/Login'
import ForgotPassword from './features/Auth/ForgotPassword'
import Dashboard from './features/dashboard/Dashboard'
import Tasks from './features/Tasks/Tasks'
import UsersPage from './features/Users/pages/UsersPage'
import AboutPage from './features/About/pages/AboutPage'
import ProfilePage from './features/Profile/pages/ProfilePage'
import { useAuth } from './context/AuthContext'

const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth()
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/tasks"
          element={
            <RoleGuard allowedRoles={['manager', 'team']}>
              <Tasks />
            </RoleGuard>
          }
        />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App