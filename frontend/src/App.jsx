import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './features/Auth/Login'
import Dashboard from './features/dashboard/Dashboard'
import Tasks from './features/Tasks/Tasks'
import UsersPage from './features/Users/pages/UsersPage'
import AboutPage from './features/About/pages/AboutPage'
import ProfilePage from './features/Profile/pages/ProfilePage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
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
