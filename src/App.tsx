import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleGate from './components/RoleGate'
import EmployeesPage from './pages/EmployeesPage'
import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'
import StaffRegisterPage from './pages/StaffRegisterPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import FormPage from './pages/FormPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="employees" element={<EmployeesPage />} />
        <Route
          path="staff/register"
          element={
            <RoleGate allow={['HR_ADMIN']} fallback={<UnauthorizedPage />}>
              <StaffRegisterPage />
            </RoleGate>
          }
        />
        <Route
          path="entry"
          element={
            <RoleGate
              allow={["HR_ADMIN", "DATA_ENTRY"]}
              fallback={<UnauthorizedPage />}
            >
              <FormPage />
            </RoleGate>
          }
        />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard/employees" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
/*
echo "# UICL--website" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/nestsoft-dev/UICL--website.git
git push -u origin main
*/