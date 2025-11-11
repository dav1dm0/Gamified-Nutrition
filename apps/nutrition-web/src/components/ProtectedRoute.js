
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AUTH_TOKEN_KEY } from '../constants';

export default function ProtectedRoute() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}