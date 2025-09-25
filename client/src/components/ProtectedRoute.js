
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  console.log('Token retrieved:', token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
} 