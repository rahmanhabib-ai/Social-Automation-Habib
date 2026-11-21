/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import PublicHomepage from './components/PublicHomepage';
import { SidebarProvider } from './context/SidebarContext';
import { getLastActiveRoute, clearActiveSession } from './utils/session';

// Smart Home Wrapper: Automatically restores the last active page on reload/refresh unless logged out
function HomeRouteHandler() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // If user requested logout or stay on homepage explicitly
  if (searchParams.get('logout') === 'true') {
    clearActiveSession();
    return <PublicHomepage />;
  }

  const lastActiveRoute = getLastActiveRoute();
  if (lastActiveRoute && lastActiveRoute !== '/' && lastActiveRoute !== '/home') {
    return <Navigate to={lastActiveRoute} replace />;
  }

  return <PublicHomepage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<HomeRouteHandler />} />
          <Route path="/home" element={<HomeRouteHandler />} />
          <Route path="/login" element={<PublicHomepage initialAuth="login" />} />
          <Route path="/register" element={<PublicHomepage initialAuth="register" />} />
          <Route path="/admin/*" element={<MainLayout portalType="admin" />} />
          <Route path="/business_admin/*" element={<MainLayout portalType="admin" />} />
          <Route path="/business-admin/*" element={<MainLayout portalType="admin" />} />
          <Route path="/user/*" element={<MainLayout portalType="user" />} />
          <Route path="*" element={<MainLayout portalType="admin" />} />
        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}

