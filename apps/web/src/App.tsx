import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthComponent, LayoutComponent } from './components';
import { protectedRoutes, publicRoutes } from './routes';

export default function App() {
  return (
    <Router>
      <AuthComponent.FirebaseAuthSync />
      <Routes>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        <Route
          path="/*"
          element={
            <AuthComponent.AuthGuard>
              <LayoutComponent.Shell>
                <Routes>
                  {protectedRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                  ))}
                </Routes>
              </LayoutComponent.Shell>
            </AuthComponent.AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}
