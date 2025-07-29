// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';

import theme from './styles/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Clients from './pages/admin/Clients';
import Practices from './pages/admin/Practices';
import Documents from './pages/admin/Documents';

// Client Pages
import ClientLogin from './pages/client/ClientLogin';
import ClientArea from './pages/client/ClientArea';
import ClientPracticeDetail from './pages/client/ClientPracticeDetail';

// Components
import LoadingSpinner from './components/common/LoadingSpinner';
import Layout from './components/common/Layout';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, requiredUserType }) => {
  const { isAuthenticated, userType, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${requiredUserType}/login`} replace />;
  }

  if (userType !== requiredUserType) {
    return <Navigate to={`/${userType === 'admin' ? 'admin' : 'client'}/dashboard`} replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children, userType }) => {
  const { isAuthenticated, userType: currentUserType, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to={`/${currentUserType}/dashboard`} replace />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* Admin Routes */}
      <Route 
        path="/admin/login" 
        element={
          <PublicRoute userType="admin">
            <AdminLogin />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute requiredUserType="admin">
            <Layout userType="admin">
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/clients" 
        element={
          <ProtectedRoute requiredUserType="admin">
            <Layout userType="admin">
              <Clients />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/practices" 
        element={
          <ProtectedRoute requiredUserType="admin">
            <Layout userType="admin">
              <Practices />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/documents" 
        element={
          <ProtectedRoute requiredUserType="admin">
            <Layout userType="admin">
              <Documents />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Client Routes */}
      <Route 
        path="/client/login" 
        element={
          <PublicRoute userType="client">
            <ClientLogin />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/client/dashboard" 
        element={
          <ProtectedRoute requiredUserType="client">
            <Layout userType="client">
              <ClientArea />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/client/practice/:id" 
        element={
          <ProtectedRoute requiredUserType="client">
            <Layout userType="client">
              <ClientPracticeDetail />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={6000}
        >
          <AuthProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;