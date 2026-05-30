import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SurveyTaking from './pages/SurveyTaking';
import SurveyStats from './pages/SurveyStats';
import SurveyCreation from './pages/SurveyCreation';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-slate-400 font-medium">Đang tải hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="relative min-h-screen overflow-x-hidden">
        {/* Background Mesh Gradients */}
        <div className="bg-mesh"></div>

        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login onLogin={login} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" replace /> : <Register />} 
          />

          {/* Protected Main Landing Route */}
          <Route 
            path="/" 
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

          {/* User Survey taking */}
          <Route 
            path="/survey/:id" 
            element={
              user ? <SurveyTaking user={user} onLogout={logout} /> : <Navigate to="/login" replace />
            } 
          />

          {/* Admin Stats & Chart Details */}
          <Route 
            path="/survey/:id/stats" 
            element={
              user && ['Admin', 'Manager'].includes(user.role) ? (
                <SurveyStats user={user} onLogout={logout} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Admin Create & Edit Survey */}
          <Route 
            path="/survey/create" 
            element={
              user && user.role === 'Admin' ? (
                <SurveyCreation user={user} onLogout={logout} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/survey/edit/:id" 
            element={
              user && user.role === 'Admin' ? (
                <SurveyCreation user={user} onLogout={logout} isEdit={true} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
