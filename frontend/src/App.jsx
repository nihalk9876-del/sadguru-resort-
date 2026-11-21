import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import HomePage from './pages/HomePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminApp from './pages/AdminApp';

export default function App() {
  const isNative = Capacitor.isNativePlatform();

  return (
    <Router>
      <Routes>
        <Route path="/" element={isNative ? <AdminApp /> : <HomePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/app" element={<AdminApp />} />
        <Route path="/admin/app" element={<AdminApp />} />
        <Route path="*" element={<Navigate to={isNative ? "/app" : "/"} replace />} />
      </Routes>
    </Router>
  );
}
