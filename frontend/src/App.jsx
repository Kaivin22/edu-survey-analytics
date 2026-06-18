import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SurveyTaking from './pages/SurveyTaking';
import SurveyStats from './pages/SurveyStats';
import SurveyCreation from './pages/SurveyCreation';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFD' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #D2DBEA', borderTopColor: '#6E9AE0', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#6E9AE0', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Đang tải hệ thống...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ── Public Landing page (always accessible at /) ── */}
        <Route path="/" element={<Landing />} />

        {/* ── Auth pages ── */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={login} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
        />

        {/* ── Protected Dashboard (redirect here after login) ── */}
        <Route
          path="/dashboard"
          element={
            user ? (
              ['Admin', 'Manager'].includes(user.role) ? (
                <AdminDashboard user={user} onLogout={logout} />
              ) : (
                <Dashboard user={user} onLogout={logout} />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ── Survey taking ── */}
        <Route
          path="/survey/:id"
          element={user ? <SurveyTaking user={user} onLogout={logout} /> : <Navigate to="/login" replace />}
        />

        {/* ── Survey stats (Admin/Manager only) ── */}
        <Route
          path="/survey/:id/stats"
          element={
            user && ['Admin', 'Manager'].includes(user.role) ? (
              <SurveyStats user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ── Survey creation/editing (Admin only) ── */}
        <Route
          path="/survey/create"
          element={
            user && user.role === 'Admin' ? (
              <SurveyCreation user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/survey/edit/:id"
          element={
            user && user.role === 'Admin' ? (
              <SurveyCreation user={user} onLogout={logout} isEdit={true} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ── Catch-all: redirect to landing ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
