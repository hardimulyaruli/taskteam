import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './features/Auth/Login'
import Dashboard from './features/dashboard/Dashboard'
import Tasks from './features/Tasks/Tasks'

const PlaceholderPage = ({ title }) => (
  <div className="dashboard-page">
    <h1 className="dashboard-greeting">{title}</h1>
    <p className="dashboard-greeting-sub">Halaman ini belum diimplementasikan.</p>
  </div>
)

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/users" element={<PlaceholderPage title="Users" />} />
        <Route path="/about" element={<PlaceholderPage title="About Us" />} />
        <Route path="/profile" element={<PlaceholderPage title="Profil Pribadi" />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
