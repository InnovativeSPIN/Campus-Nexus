import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ALLOWED_ROLES = [
  'executive',
  'executiveadmin',
  'executive-admin',
  'superadmin',
  'super-admin',
  'principal',
  'vice-principal',
  'vice principal',
  'admin',
];

interface ExecutiveProtectedRouteProps {
  children: React.ReactNode;
}

export default function ExecutiveProtectedRoute({ children }: ExecutiveProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleName = typeof user.role === 'object'
    ? ((user.role as any)?.role_name || (user.role as any)?.name || '')
    : (user.role || '');
  const userRole = String(roleName).toLowerCase();

  if (!ALLOWED_ROLES.includes(userRole)) {
    console.warn('[ExecutiveProtectedRoute] Role not allowed:', userRole, user);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
