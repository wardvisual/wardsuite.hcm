import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthComponent, LayoutComponent } from './components';
import { LoginPage, RegisterPage } from '@web/modules/auth';
import LandingModule from './modules/Landing';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Redirect root to login */}
        {/* <Route path="/" element={<Navigate to="/auth/login" replace />} /> */}
        <Route path="/" element={<LandingModule />} />

        {/* Protected app routes */}
        <Route
          path="/*"
          element={
            <AuthComponent.AuthGuard>
              <LayoutComponent.Shell>
                <Routes>
                  {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </LayoutComponent.Shell>
            </AuthComponent.AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}
