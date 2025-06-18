import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config/config.js';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';

const WebsiteSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowUserRegistration: true,
    enableComments: true,
    maxUploadSize: '5'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_BASE_URL}/api/settings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSettings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
      setLoading(false);
    }
  };

  const handleToggle = async (setting) => {
    try {
      setSaving(true);
      const newValue = !settings[setting];
      
      await axios.patch(`${config.API_BASE_URL}/api/settings/${setting}`, 
        { value: newValue },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSettings(prev => ({
        ...prev,
        [setting]: newValue
      }));

      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectChange = async (setting, value) => {
    try {
      setSaving(true);
      
      await axios.patch(`${config.API_BASE_URL}/api/settings/${setting}`, 
        { value },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSettings(prev => ({
        ...prev,
        [setting]: value
      }));

      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Website Settings</h1>
        
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {/* Maintenance Mode */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Maintenance Mode</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enable maintenance mode to temporarily disable the website for regular users
                </p>
              </div>
              <button
                onClick={() => handleToggle('maintenanceMode')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* User Registration */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Allow User Registration</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enable or disable new user registrations
                </p>
              </div>
              <button
                onClick={() => handleToggle('allowUserRegistration')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.allowUserRegistration ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.allowUserRegistration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Enable Comments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Allow users to comment on posts and discussions
                </p>
              </div>
              <button
                onClick={() => handleToggle('enableComments')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.enableComments ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.enableComments ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Max Upload Size */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Maximum Upload Size</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Set the maximum file size for uploads (in MB)
                </p>
              </div>
              <select
                value={settings.maxUploadSize}
                onChange={(e) => handleSelectChange('maxUploadSize', e.target.value)}
                disabled={saving}
                className="mt-1 block w-24 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="5">5 MB</option>
                <option value="10">10 MB</option>
                <option value="20">20 MB</option>
                <option value="50">50 MB</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WebsiteSettings;