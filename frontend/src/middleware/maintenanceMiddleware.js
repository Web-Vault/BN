import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config.js';

// Function to check if site is in maintenance mode
const checkMaintenance = async () => {
  try {
    const response = await axios.get(`${config.API_BASE_URL}/api/settings/maintenance`);
    return response.data.maintenanceMode || false;
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return false;
  }
};

// Function to check if current user is admin
const checkIsAdmin = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const response = await axios.get(`${config.API_BASE_URL}/api/admin/current`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// List of routes that should be accessible during maintenance
const MAINTENANCE_ALLOWED_ROUTES = [
  '/maintenance',
  '/login',
  '/admin',
  '/admin/settings',
  '/admin/users',
  '/admin/chapters',
  '/admin/reports',
  '/admin/membership',
  '/admin/analytics'
];

// Component to handle maintenance mode routing
export const MaintenanceRoute = ({ children }) => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      const [maintenanceStatus, adminStatus] = await Promise.all([
        checkMaintenance(),
        checkIsAdmin()
      ]);
      console.log('Maintenance status:', maintenanceStatus); // Debug log
      console.log('Admin status:', adminStatus); // Debug log
      setIsMaintenance(maintenanceStatus);
      setIsAdmin(adminStatus);
      setIsLoading(false);
    };

    checkStatus();
  }, []);

  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if the current route is allowed during maintenance
  const isAllowedRoute = MAINTENANCE_ALLOWED_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );

  // If in maintenance mode and not on an allowed route
  if (isMaintenance && !isAllowedRoute) {
    // If user is admin and on root path, redirect to admin dashboard
    if (isAdmin && location.pathname === '/') {
      console.log('Redirecting admin to dashboard'); // Debug log
      return <Navigate to="/admin" replace />;
    }
    
    // Otherwise, redirect to maintenance page
    console.log('Redirecting to maintenance page'); // Debug log
    return <Navigate to="/maintenance" replace />;
  }

  // Otherwise, render the children
  return children;
}; 