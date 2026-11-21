import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './features/public/HomePage';
import ShopCatalogPage from './features/shop/ShopCatalogPage';
import LoginPage from './features/auth/LoginPage';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-sm text-neutral-500">Authenticating...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// Placeholder simple dashboards for initial scaffolding
function MemberDashboard() {
  const { user } = useAuth();
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <h1 className="text-xl font-bold uppercase tracking-tight text-[#111111]">Welcome back, {user?.name}</h1>
        <p className="text-xs text-neutral-500 mt-1">Member Tier: <span className="font-bold text-[#C8102E]">{user?.plan_name || 'Gold'}</span> | Max daily sessions: 2</p>
        <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <p className="text-xs text-neutral-600">Your member dashboard structure is live and ready for team enhancements!</p>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <h1 className="text-xl font-bold uppercase tracking-tight text-[#111111]">Owner & Admin KPI Overview</h1>
        <p className="text-xs text-neutral-500 mt-1">Central analytics for Courts, Gear Shop, Café & Memberships</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopCatalogPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route
              path="member/dashboard"
              element={
                <ProtectedRoute allowedRoles={['member', 'admin']}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
