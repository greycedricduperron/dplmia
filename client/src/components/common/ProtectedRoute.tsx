import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { teacher, loading } = useAuth();
  if (loading) return <div className="loading">Chargement…</div>;
  if (!teacher) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
