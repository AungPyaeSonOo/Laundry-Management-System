import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryOrderDetail from './pages/DeliveryOrderDetail';
import DeliveryHistory from './pages/DeliveryHistory';
import WasherDashboard from './pages/WasherDashboard';
import WasherHistory from './pages/WasherHistory';
import WasherOrderDetail from './pages/WasherOrderDetail';
import IronerDashboard from './pages/IronerDashboard';
import IronerHistory from './pages/IronerHistory';
import IronerOrderDetail from './pages/IronerOrderDetail';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import EmployeesPage from './pages/EmployeesPage';
import UsersPage from './pages/UsersPage';
import ExpensesPage from './pages/ExpensesPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import ClothingTypesPage from './pages/ClothingTypesPage';
import PackerDashboard from './pages/PackerDashboard';
import PackerHistory from './pages/PackerHistory';
import PackerOrderDetail from './pages/PackerOrderDetail';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  const role = user?.role || 'employee';
  const position = user?.position || '';
  
  // ✅ Admin -> AdminDashboard
  if (role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }
  
  // Manager/Accountant -> Dashboard
  if (role === 'accountant' || role === 'manager') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Delivery
  if (role === 'delivery') {
    return <Navigate to="/delivery-dashboard" replace />;
  }
  
  // Employee
  if (role === 'employee') {
    if (position === 'washer') {
      return <Navigate to="/washer-dashboard" replace />;
    }
    if (position === 'ironer') {
      return <Navigate to="/ironer-dashboard" replace />;
    }
    if (position === 'packer') {
      return <Navigate to="/packer-dashboard" replace />;
    }
    return <Navigate to="/washer-dashboard" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Auth Layout - No Sidebar */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* ✅ Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<MainLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/clothing-types" element={<ClothingTypesPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* ✅ Manager/Accountant Routes */}
          <Route element={<ProtectedRoute allowedRoles={['accountant', 'manager']} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/clothing-types" element={<ClothingTypesPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* ✅ Delivery Routes */}
          <Route element={<ProtectedRoute allowedRoles={['delivery']} />}>
            <Route element={<MainLayout />}>
              <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
              <Route path="/delivery-history" element={<DeliveryHistory />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/delivery-order/:id" element={<DeliveryOrderDetail />} />
            </Route>
          </Route>

          {/* ✅ Washer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route element={<MainLayout />}>
              <Route path="/washer-dashboard" element={<WasherDashboard />} />
              <Route path="/washer-history" element={<WasherHistory />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/washer-order/:id" element={<WasherOrderDetail />} />
            </Route>
          </Route>

          {/* ✅ Ironer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route element={<MainLayout />}>
              <Route path="/ironer-dashboard" element={<IronerDashboard />} />
              <Route path="/ironer-history" element={<IronerHistory />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/ironer-order/:id" element={<IronerOrderDetail />} />
            </Route>
          </Route>

          {/* ✅ Packer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route element={<MainLayout />}>
              <Route path="/packer-dashboard" element={<PackerDashboard />} />
              <Route path="/packer-history" element={<PackerHistory />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/packer-order/:id" element={<PackerOrderDetail />} />
            </Route>
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;